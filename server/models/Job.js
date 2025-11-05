import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    level: { type: String, required: true, trim: true },
    salary: { type: Number, required: true, min: 0 },
    visible: { type: Boolean, default: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

const Job = mongoose.model("Job", jobSchema);

export default Job;
