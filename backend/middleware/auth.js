const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports.verifyToken = function (req, res, next) {
  const token = req.header("token");

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token, authorization denied" });
  }

  if (!process.env.JWT_SECRET) {
    return res
      .status(500)
      .json({
        success: false,
        message: "JWT secret is not set in environment variables",
      });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// role based token verification middleware
module.exports.verifyRole = function (allowedRoles) {
  return function (req, res, next) {
    const token = req.header("token");
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token, authorization denied" });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      if (!allowedRoles.includes(req.user.role)) {
        return res
          .status(403)
          .json({
            success: false,
            message: "Access denied: insufficient permissions",
          });
      }
      next();
    } catch (error) {
      res.status(401).json({ success: false, message: "Invalid token" });
    }
  };
};
