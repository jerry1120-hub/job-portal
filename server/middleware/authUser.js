import { getAuth } from "@clerk/express";

export const protectUser = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in again.",
      });
    }

    req.clerkId = userId; // ✅ attach to request
    next();
  } catch (error) {
    console.error("❌ protectUser error:", error);
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
