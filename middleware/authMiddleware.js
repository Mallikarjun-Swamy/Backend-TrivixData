import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

export const authMiddleware = (req, res, next) => {
  const accessToken = req.cookies.access_token;

  if (!accessToken) {
    return res.status(401).json({ message: "Unauthorized: No access token" });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch (err) {
    // If token is invalid or expired, send 401.
    // The frontend should catch this and call the refresh endpoint.
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid or expired token" });
  }
};
