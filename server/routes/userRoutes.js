import express from "express";
import {
  applyForJob,
  getUserData,
  getUserJobApplications,
  updateUserResume,
} from "../controllers/userController.js";
import upload from "../config/multer.js";
import { requireAuth } from "@clerk/express";

const router = express.Router();

// ✅ Health check (optional)
router.get("/", (req, res) => {
  res.json({ message: "User routes working ✅" });
});

// ✅ Get logged-in user data
router.get("/data", requireAuth(), getUserData);

// ✅ Get all applications by logged-in user
router.get("/applications", requireAuth(), getUserJobApplications);

// ✅ Apply for a job (Clerk protected)
router.post("/apply", requireAuth(), applyForJob);

// ✅ Upload or update user resume
router.post(
  "/update-resume",
  requireAuth(),
  upload.single("resume"),
  updateUserResume
);

export default router;
