import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/UserRepository.js";
const JWT_SECRET = process.env.JWT_SECRET || "eventbridge_secret_key_2026";
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return next();
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userRepo = new UserRepository();
    const fullUser = await userRepo.findById(decoded.userId);
    if (fullUser && fullUser.status === "ACTIVE") {
      const { passwordHash, ...userWithoutPassword } = fullUser;
      req.user = userWithoutPassword;
    }
  } catch (err) {
  }
  next();
};
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Authentication required. Please log in." });
  }
  next();
};
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions for this role." });
    }
    next();
  };
};
