// middleware/authorize.js
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const { role } = req.user; // assume decoded from JWT
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}

module.exports = authorizeRoles;
