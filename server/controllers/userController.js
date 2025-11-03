import JobApplication from "../models/JobApplication.js";
import User from "../models/User.js";
import Job from "../models/Job.js";
import { v2 as cloudinary } from "cloudinary";
import { clerkClient } from "@clerk/express"; // ✅ Clerk client

// ✅ Helper: Get or create user safely
const findOrCreateUser = async (userId) => {
  let user = await User.findOne({ clerkId: userId });

  if (!user) {
    const clerkUser = await clerkClient.users.getUser(userId);

    user = await User.create({
      clerkId: userId,
      name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "New User",
      email: clerkUser.emailAddresses?.[0]?.emailAddress || "unknown@example.com",
      image: clerkUser.imageUrl || "",
    });
  }

  return user;
};

// ✅ Get user data
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.auth;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await findOrCreateUser(userId);
    res.json({ success: true, user });
  } catch (error) {
    console.error("❌ getUserData error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Apply for a job
export const applyForJob = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { jobId } = req.body;

    const user = await findOrCreateUser(userId);

    const alreadyApplied = await JobApplication.findOne({ jobId, userId });
    if (alreadyApplied) {
      return res.json({ success: false, message: "Already applied for this job." });
    }

    const jobData = await Job.findById(jobId);
    if (!jobData) {
      return res.json({ success: false, message: "Job not found." });
    }

    await JobApplication.create({
      companyId: jobData.companyId,
      userId,
      jobId,
      date: Date.now(),
    });

    res.json({ success: true, message: "Job application submitted successfully!" });
  } catch (error) {
    console.error("❌ applyForJob error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get user job applications
export const getUserJobApplications = async (req, res) => {
  try {
    const { userId } = req.auth;

    const user = await findOrCreateUser(userId);

    const applications = await JobApplication.find({ userId })
      .populate("companyId", "name email image")
      .populate("jobId", "title description location category level salary")
      .exec();

    res.json({
      success: true,
      userApplications: applications || [],
    });
  } catch (error) {
    console.error("❌ getUserJobApplications error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update user resume
export const updateUserResume = async (req, res) => {
  try {
    const { userId } = req.auth;
    const resumeFile = req.file;

    const user = await findOrCreateUser(userId);

    if (resumeFile) {
      const resumeUpload = await cloudinary.uploader.upload(resumeFile.path, {
        folder: "resumes",
      });
      user.resume = resumeUpload.secure_url;
    }

    await user.save();

    res.json({ success: true, message: "Resume updated successfully!" });
  } catch (error) {
    console.error("❌ updateUserResume error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
