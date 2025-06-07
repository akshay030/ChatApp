import User from "../models/User.js"
import jwt from "jsonwebtoken"

export const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized: Token missing" });
    }

    const token = authHeader.split(" ")[1]; // Get token after 'Bearer '

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
   // console.log(error.message);
    res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
  }
}
