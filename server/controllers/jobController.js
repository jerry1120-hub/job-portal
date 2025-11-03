import mongoose from "mongoose";
import Job from "../models/Job.js";

// ✅ Get all visible jobs
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ visible: true })
      .populate({
        path: "companyId",
        select: "-password -__v", // hide sensitive info
      })
      .sort({ date: -1 }); // show latest jobs first

    return res.status(200).json({
      success: true,
      jobs,
    });
  } catch (error) {
    console.error("❌ Error fetching jobs:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching jobs",
    });
  }
};

// ✅ Get a single job by ID
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await Job.findById(id).populate({
      path: "companyId",
      select: "-password -__v",
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("❌ Error fetching job by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching job",
    });
  }
};
