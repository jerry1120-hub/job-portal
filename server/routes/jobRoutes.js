import express from "express";
import { getJobs, getJobById } from "../controllers/jobController.js";

const router = express.Router();

// ✅ Route: Get all visible jobs
router.get("/", getJobs);

// ✅ Route: Get a single job by its ID
router.get("/:id", getJobById);

export default router;
