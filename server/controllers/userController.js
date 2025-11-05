import JobApplication from '../models/JobApplication.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import { v2 as cloudinary } from 'cloudinary';
import { clerkClient } from '@clerk/express';

// 🔧 Helper — Find or create user by Clerk ID
const findOrCreateUser = async (clerkId) => {
  if (!clerkId) throw new Error('Unauthorized');

  let user = await User.findOne({ clerkId });
  if (!user) {
    const clerkUser = await clerkClient.users.getUser(clerkId);
    if (!clerkUser) throw new Error('Clerk user not found');

    user = await User.create({
      clerkId,
      name:
        `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
        'New User',
      email: clerkUser.emailAddresses?.[0]?.emailAddress || 'unknown@example.com',
      image: clerkUser.imageUrl || '',
    });
  }
  return user;
};

// 👤 Get or create user data
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.auth;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    let user = await findOrCreateUser(userId);
    res.json({ success: true, user });
  } catch (error) {
    console.error('❌ getUserData error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📄 Update resume
export const updateUserResume = async (req, res) => {
  try {
    const { userId } = req.auth;
    if (!userId) return res.status(401).json({ success: false, message: 'Not authenticated.' });

    const user = await findOrCreateUser(userId);
    const resumeFile = req.file;
    if (!resumeFile)
      return res.status(400).json({ success: false, message: 'No resume file uploaded.' });

    const uploaded = await cloudinary.uploader.upload(resumeFile.path, { folder: 'resumes' });
    user.resume = uploaded.secure_url;
    await user.save();

    res.json({ success: true, message: 'Resume updated successfully!', resume: user.resume });
  } catch (error) {
    console.error('❌ updateUserResume error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 💼 Apply for job
export const applyForJob = async (req, res) => {
  try {
    const clerkId = req.auth?.userId;
    const { jobId } = req.body;

    if (!clerkId) return res.status(401).json({ success: false, message: "Not authenticated." });
    if (!jobId) return res.status(400).json({ success: false, message: "Job ID is required." });

    const user = await findOrCreateUser(clerkId);
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: "Job not found." });

    const alreadyApplied = await JobApplication.findOne({
      jobId,
      userId: user._id, // ✅ make sure this matches the schema
    });
    if (alreadyApplied)
      return res.json({ success: false, message: "Already applied." });

    const application = await JobApplication.create({
      companyId: job.companyId,
      jobId,
      userId: user._id, // ✅ save under `userId`
      status: "Pending",
    });

    res.json({ success: true, message: "Applied successfully!", application });
  } catch (error) {
    console.error("❌ applyForJob error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📋 Get user job applications
export const getUserJobApplications = async (req, res) => {
  try {
    const { userId } = req.auth;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await findOrCreateUser(userId);

    const applications = await JobApplication.find({ userId: user._id }) // ✅ match field
      .populate("jobId")
      .populate("companyId");

    res.status(200).json({
      success: true,
      userApplications: applications, // ✅ matches frontend context
    });
  } catch (error) {
    console.error("❌ Error getting user applications:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
