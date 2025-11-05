// models/JobApplication.js
import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, default: "Pending" },
  date: { type: Date, default: Date.now }
});

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);
export default JobApplication;
