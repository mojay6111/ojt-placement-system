const jwt = require("jsonwebtoken");
const prisma = require("../prisma");

// Middleware: Verify JWT
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Invalid token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userID, role, iat, exp }
    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

// Middleware: Role-based access
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};


module.exports = { authenticate, authorizeRoles };
