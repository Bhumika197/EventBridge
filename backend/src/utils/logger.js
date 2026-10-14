class Logger {
  formatTimestamp() {
    return (/* @__PURE__ */ new Date()).toISOString();
  }
  sanitize(data) {
    if (!data) return data;
    if (typeof data === "string") return data;
    if (typeof data !== "object") return data;
    const copy = Array.isArray(data) ? [...data] : { ...data };
    const sensitiveKeys = ["password", "passwordHash", "token", "secret", "authorization"];
    for (const key of Object.keys(copy)) {
      if (sensitiveKeys.includes(key.toLowerCase())) {
        copy[key] = "[REDACTED]";
      } else if (typeof copy[key] === "object" && copy[key] !== null) {
        copy[key] = this.sanitize(copy[key]);
      }
    }
    return copy;
  }
  info(message, meta) {
    const metaStr = meta ? ` | ${JSON.stringify(this.sanitize(meta))}` : "";
    console.log(`[${this.formatTimestamp()}] [INFO] ${message}${metaStr}`);
  }
  warn(message, meta) {
    const metaStr = meta ? ` | ${JSON.stringify(this.sanitize(meta))}` : "";
    console.warn(`[${this.formatTimestamp()}] [WARN] ${message}${metaStr}`);
  }
  error(message, error) {
    let errStr = "";
    if (error) {
      if (error instanceof Error) {
        errStr = ` | ${error.message}`;
      } else {
        errStr = ` | ${JSON.stringify(this.sanitize(error))}`;
      }
    }
    console.error(`[${this.formatTimestamp()}] [ERROR] ${message}${errStr}`);
  }
  debug(message, meta) {
    if (process.env.NODE_ENV === "development") {
      const metaStr = meta ? ` | ${JSON.stringify(this.sanitize(meta))}` : "";
      console.debug(`[${this.formatTimestamp()}] [DEBUG] ${message}${metaStr}`);
    }
  }
}
export const logger = new Logger();
