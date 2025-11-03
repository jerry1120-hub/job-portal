import JobApplication from "../models/JobApplication.js";
import User from "../models/User.js";
import Job from "../models/Job.js";
import { v2 as cloudinary } from "cloudinary";

// ✅ Get user data (only for existing users)
export const getUserData = async (req, res) => {
  const { userId } = req.auth();

  try {
    const user = await User.findById(userId);

    if (!user) {
      // ❌ No auto-creation — user must exist
      return res.status(404).json({
        success: false,
        message: "User not found. Please register before continuing.",
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Apply for a job
export const applyForJob = async (req, res) => {
  const { userId } = req.auth();
  const { jobId } = req.body;

  try {
    // Check if user exists first
    const user = await User.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found. Please register before applying.",
      });
    }

    // Prevent duplicate applications
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
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get user job applications
export const getUserJobApplications = async (req, res) => {
  const { userId } = req.auth();

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found. Please register before viewing applications.",
      });
    }

    const applications = await JobApplication.find({ userId })
      .populate("companyId", "name email image")
      .populate("jobId", "title description location category level salary")
      .exec();

    // ✅ Always return an array
    res.json({
      success: true,
      userApplications: applications || [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update user resume
export const updateUserResume = async (req, res) => {
  const { userId } = req.auth();
  const resumeFile = req.file;

  try {
    const userData = await User.findById(userId);
    if (!userData) {
      return res.json({ success: false, message: "User not found. Please register first." });
    }

    if (resumeFile) {
      const resumeUpload = await cloudinary.uploader.upload(resumeFile.path, {
        folder: "resumes",
      });
      userData.resume = resumeUpload.secure_url;
    }

    await userData.save();

    res.json({ success: true, message: "Resume updated successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
