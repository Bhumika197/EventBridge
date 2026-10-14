import fs from "fs";
import path from "path";
import zlib from "zlib";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_USERS_CAPACITY = 60;
const MAX_LOGS_PER_USER = 60;

/**
 * Custom High-Performance Log Database
 * - Capacity: 60 active users
 * - Capacity: 60 circular log entries per user
 * - Circular Buffer: On 61st entry, evicts the 1st (oldest) log entry
 * - Low-Level Archival: Encodes evicted entry into a compact binary format (.bin)
 * - Decoder: Full binary decoding capability to retrieve historical logs on-demand
 * - Non-blocking traffic-free concurrency for 10+ concurrent users
 */
export class CustomLogDatabase {
  static instance = null;

  users = new Map(); // userId -> User metadata
  userLogs = new Map(); // userId -> Circular buffer of max 60 log entries
  archivePath;
  userQueues = new Map(); // Async concurrency mutex per user

  constructor() {
    const isVercel = Boolean(process.env.VERCEL);
    const dataDir = isVercel ? "/tmp" : path.join(__dirname, "../../data");
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (e) {}
    }
    this.archivePath = path.join(dataDir, "user_logs_archive.bin");
  }

  static getInstance() {
    if (!CustomLogDatabase.instance) {
      CustomLogDatabase.instance = new CustomLogDatabase();
    }
    return CustomLogDatabase.instance;
  }

  /**
   * Register or touch user in the custom DB (Capacity: 60 users)
   */
  async registerUser(user) {
    if (!user || !user.userId) return false;
    const userId = Number(user.userId);

    // If new user and already at capacity, enforce 60 user limit
    if (!this.users.has(userId) && this.users.size >= MAX_USERS_CAPACITY) {
      // Find oldest non-admin student to evict if necessary
      for (const [id, u] of this.users.entries()) {
        if (u.role !== "PLATFORM_ADMIN" && !u.username.includes("admin")) {
          this.users.delete(id);
          this.userLogs.delete(id);
          break;
        }
      }
    }

    this.users.set(userId, {
      userId,
      username: user.username,
      email: user.email,
      role: user.role || "STUDENT",
      collegeId: user.collegeId,
      createdAt: user.createdAt || new Date().toISOString()
    });

    if (!this.userLogs.has(userId)) {
      this.userLogs.set(userId, []);
    }
    return true;
  }

  /**
   * Concurrency-safe queue executor per user
   */
  async withUserLock(userId, fn) {
    let queue = this.userQueues.get(userId);
    if (!queue) {
      queue = Promise.resolve();
      this.userQueues.set(userId, queue);
    }
    const nextQueue = queue.then(async () => {
      try {
        return await fn();
      } catch (err) {
        console.error(`Error in user log queue for user #${userId}:`, err);
      }
    });
    this.userQueues.set(userId, nextQueue.catch(() => {}));
    return nextQueue;
  }

  /**
   * Append a log entry for a user.
   * If entries reach 60, evicts entry #1 and stores it in low-level archive.
   */
  async appendLog(userId, action, details = {}, ip = "127.0.0.1") {
    userId = Number(userId);
    if (!userId) return null;

    return this.withUserLock(userId, async () => {
      let logs = this.userLogs.get(userId);
      if (!logs) {
        logs = [];
        this.userLogs.set(userId, logs);
      }

      const timestamp = new Date().toISOString();
      const logEntry = {
        logId: Date.now() + Math.floor(Math.random() * 1000),
        userId,
        action,
        details: typeof details === "object" ? details : { info: details },
        timestamp,
        ip
      };

      // Check capacity: If 60 entries reached, evict the 1st entry
      let evictedEntry = null;
      if (logs.length >= MAX_LOGS_PER_USER) {
        evictedEntry = logs.shift(); // Evict 1st entry
        await this.archiveLowLevel(evictedEntry);
      }

      // Add 61st entry (keeping buffer size at exactly <= 60)
      logs.push(logEntry);

      return {
        logged: logEntry,
        evictedToArchive: Boolean(evictedEntry),
        activeLogCount: logs.length
      };
    });
  }

  /**
   * Low-Level Binary Encoder for evicted log entries.
   * Format:
   * [4 bytes: Magic "EBLG" 0x45 0x42 0x4C 0x47]
   * [4 bytes: Epoch seconds (uint32)]
   * [2 bytes: userId (uint16)]
   * [1 byte:  Action length (uint8)]
   * [N bytes: Action string (utf-8)]
   * [2 bytes: Payload length (uint16)]
   * [M bytes: Gzip-compressed JSON payload]
   * [1 byte:  Checksum XOR]
   */
  async archiveLowLevel(logEntry) {
    try {
      const magic = Buffer.from([0x45, 0x42, 0x4C, 0x47]); // "EBLG"
      const epochSec = Math.floor(new Date(logEntry.timestamp).getTime() / 1000);
      const timeBuf = Buffer.alloc(4);
      timeBuf.writeUInt32BE(epochSec, 0);

      const userBuf = Buffer.alloc(2);
      userBuf.writeUInt16BE(logEntry.userId % 65535, 0);

      const actionBuf = Buffer.from(logEntry.action || "UNKNOWN", "utf8");
      const actionLenBuf = Buffer.from([actionBuf.length]);

      const jsonStr = JSON.stringify({
        logId: logEntry.logId,
        details: logEntry.details,
        ip: logEntry.ip,
        timestamp: logEntry.timestamp
      });
      const compressedPayload = zlib.deflateSync(Buffer.from(jsonStr, "utf8"));
      const payloadLenBuf = Buffer.alloc(2);
      payloadLenBuf.writeUInt16BE(compressedPayload.length, 0);

      const dataBuf = Buffer.concat([
        magic,
        timeBuf,
        userBuf,
        actionLenBuf,
        actionBuf,
        payloadLenBuf,
        compressedPayload
      ]);

      // Simple XOR checksum byte
      let checksum = 0;
      for (const b of dataBuf) {
        checksum ^= b;
      }
      const finalRecord = Buffer.concat([dataBuf, Buffer.from([checksum])]);

      await fs.promises.appendFile(this.archivePath, finalRecord);
    } catch (err) {
      console.error("Failed to append low-level binary log archive:", err);
    }
  }

  /**
   * Low-Level Binary Decoder
   * Reads and decodes compressed binary archive files back into readable JSON log objects.
   */
  async decodeArchive(filterUserId = null) {
    if (!fs.existsSync(this.archivePath)) {
      return [];
    }

    try {
      const buffer = await fs.promises.readFile(this.archivePath);
      const decodedLogs = [];
      let offset = 0;

      while (offset < buffer.length) {
        // Look for magic header "EBLG"
        if (
          offset + 14 > buffer.length ||
          buffer[offset] !== 0x45 ||
          buffer[offset + 1] !== 0x42 ||
          buffer[offset + 2] !== 0x4C ||
          buffer[offset + 3] !== 0x47
        ) {
          offset++;
          continue;
        }

        const epochSec = buffer.readUInt32BE(offset + 4);
        const userId = buffer.readUInt16BE(offset + 8);
        const actionLen = buffer[offset + 10];
        const action = buffer.toString("utf8", offset + 11, offset + 11 + actionLen);

        const payloadLenOffset = offset + 11 + actionLen;
        const payloadLen = buffer.readUInt16BE(payloadLenOffset);

        const payloadStart = payloadLenOffset + 2;
        const payloadEnd = payloadStart + payloadLen;
        const compressedPayload = buffer.subarray(payloadStart, payloadEnd);

        let details = {};
        let ip = "127.0.0.1";
        let logId = 0;
        let originalTime = new Date(epochSec * 1000).toISOString();

        try {
          const decompressed = zlib.inflateSync(compressedPayload).toString("utf8");
          const parsed = JSON.parse(decompressed);
          details = parsed.details;
          ip = parsed.ip;
          logId = parsed.logId;
          if (parsed.timestamp) originalTime = parsed.timestamp;
        } catch (e) {
          details = { raw: "Decompression fallback" };
        }

        const record = {
          logId,
          userId,
          action,
          details,
          timestamp: originalTime,
          ip,
          source: "LOW_LEVEL_BINARY_ARCHIVE"
        };

        if (!filterUserId || userId === Number(filterUserId)) {
          decodedLogs.push(record);
        }

        offset = payloadEnd + 1; // Skip checksum byte
      }

      return decodedLogs;
    } catch (err) {
      console.error("Error decoding low-level archive:", err);
      return [];
    }
  }

  /**
   * Get active 60 logs for a user
   */
  getUserLogs(userId) {
    userId = Number(userId);
    return this.userLogs.get(userId) || [];
  }

  /**
   * Get stats about the database and archive
   */
  getDatabaseStats() {
    let totalActiveLogs = 0;
    this.userLogs.forEach((logs) => (totalActiveLogs += logs.length));

    let archiveSizeBytes = 0;
    if (fs.existsSync(this.archivePath)) {
      try {
        archiveSizeBytes = fs.statSync(this.archivePath).size;
      } catch (e) {}
    }

    return {
      activeUsersCount: this.users.size,
      maxUsersCapacity: MAX_USERS_CAPACITY,
      totalActiveLogs,
      maxLogsPerUser: MAX_LOGS_PER_USER,
      archiveSizeBytes,
      archiveLocation: this.archivePath
    };
  }
}
