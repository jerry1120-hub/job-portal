import mongoose from "mongoose";
import Job from "../models/Job.js";

// ✅ Get all visible jobs
export const getJobs = async (req, res) => {
  try {
    // Fetch only visible jobs and populate company info
    const jobs = await Job.find({ visible: true })
      .populate({
        path: "companyId",
        select: "name email image about location", // show useful company info
      })
      .sort({ createdAt: -1 }); // show latest first (use createdAt instead of date)

    if (!jobs.length) {
      return res.status(404).json({
        success: false,
        message: "No jobs available at the moment.",
      });
    }

    res.status(200).json({
      success: true,
      jobs,
    });
  } catch (error) {
    console.error("❌ Error fetching jobs:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching jobs.",
      error: error.message,
    });
  }
};

// ✅ Get a single job by ID
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId before querying MongoDB
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID format.",
      });
    }

    const job = await Job.findById(id).populate({
      path: "companyId",
      select: "name email image about location", // adjust fields as needed
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("❌ Error fetching job by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching job details.",
      error: error.message,
    });
  }
};
