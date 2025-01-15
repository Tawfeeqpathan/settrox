const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;
exports.auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if the authorization header exists
    if (!authHeader) {
      return res.status(403).json({ message: "Authorization header missing" });
    }

    // Extract the token from the authorization header
    const token = authHeader.split(" ")[1]; // Bearer Token

    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }

    // Verify the token
    jwt.verify(token, SECRET_KEY, (err, decodedData) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Token has expired" });
        } else if (err.name === "JsonWebTokenError") {
          return res.status(401).json({ message: "Invalid token" });
        } else {
          return res.status(401).json({ message: "Authentication failed" });
        }
      }

      // Attach user info to the request object
      req.userId = decodedData?.id;
      req.email = decodedData?.email; // Add more fields if necessary

      next(); // Proceed to the next middleware or route handler
    });
  } catch (error) {
    // Catch unexpected errors
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
exports.verifyRefreshToken = (token) =>
  jwt.verify(token, REFRESH_SECRET_KEY, (err, decodedData) => {
    if (decodedData) {
      return decodedData;
    }
  });

exports.adminAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if the authorization header exists
    if (!authHeader) {
      return res.status(403).json({ message: "Authorization header missing" });
    }

    // Extract the token from the authorization header
    const token = authHeader.split(" ")[1]; // Bearer Token

    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }

    // Verify the token
    jwt.verify(token, SECRET_KEY, (err, decodedData) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Token has expired" });
        } else if (err.name === "JsonWebTokenError") {
          return res.status(401).json({ message: "Invalid token" });
        }
        return res.status(401).json({ message: "Authentication failed" });
      }

      // Check if the user is an admin
      if (decodedData.role !== "admin") {
        return res.status(403).json({ message: "Access denied: Admins only" });
      }

      // Attach user info to the request object
      req.userId = decodedData.userId;
      req.email = decodedData.email;
      req.role = decodedData.role;

      next(); // Proceed to the next middleware or route handler
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
