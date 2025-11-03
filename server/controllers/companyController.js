import Company from "../models/Company.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import generateToken from "../utilis/generateToken.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js"; // ✅ added missing import

// ✅ Register a new company
export const registerCompany = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const imageFile = req.file;

    console.log("📦 Incoming Register Request:", { name, email, password });
    console.log("📸 Image File:", imageFile);

    // ✅ Validate required fields
    if (!name || !email || !password || !imageFile) {
      return res.status(400).json({
        success: false,
        message: "Missing Details — all fields including image are required.",
      });
    }

    // ✅ Check if company already exists
    const companyExists = await Company.findOne({ email });
    if (companyExists) {
      return res
        .status(400)
        .json({ success: false, message: "Company already registered" });
    }

    // ✅ Hash password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Upload image to Cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      folder: "company_logos",
    });

    // ✅ Create company record
    const company = await Company.create({
      name,
      email,
      password: hashedPassword,
      image: imageUpload.secure_url,
    });

    console.log("✅ Company registered:", company._id);

    // ✅ Return success response
    return res.status(201).json({
      success: true,
      company: {
        _id: company._id,
        name: company.name,
        email: company.email,
        image: company.image,
      },
      token: generateToken(company._id),
    });
  } catch (error) {
    console.error("❌ Error registering company:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while registering company: " + error.message,
    });
  }
};

// ✅ Company login
export const loginCompany = async (req, res) => {
  const { email, password } = req.body;

  try {
    const company = await Company.findOne({ email });

    if (!company) {
      return res.json({ success: false, message: "Company not found" });
    }

    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    res.json({
      success: true,
      company: {
        _id: company._id,
        name: company.name,
        email: company.email,
        image: company.image,
      },
      token: generateToken(company._id),
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ Get company data
export const getCompanyData = async (req, res) => {
  try {
    const company = req.company;
    if (!company) {
      return res.json({ success: false, message: "Company not found" });
    }

    res.json({ success: true, company });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ Post a new job
export const postJob = async (req, res) => {
  const { title, description, location, salary, level, category } = req.body;
  const companyId = req.company._id;

  try {
    const newJob = new Job({
      title,
      description,
      location,
      salary,
      companyId,
      date: Date.now(),
      level,
      category,
    });

    await newJob.save();

    res.json({ success: true, newJob });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ Get company’s job applicants
export const getCompanyJobApplicants = async (req, res) => {
  try {
    const companyId = req.company._id;

    // Find job applications for the user and populate related data

    const applications = await JobApplication.find({ companyId })
      .populate("userId", "name image resume")
      .populate("jobId", "title location category level salary")
      .exec()
      

     return res.json({ success: true, applications });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ Get all jobs posted by this company
export const getCompanyPostedJobs = async (req, res) => {
  try {
    // ✅ Ensure the company is properly authenticated
    const companyId = req.company._id;

    // ✅ Fetch all jobs posted by this company, newest first
    const jobs = await Job.find({ companyId }).sort({ date: -1 });

    // ✅ Attach applicant counts properly
    const jobsData = await Promise.all(
      jobs.map(async (job) => {
        const applicants = await JobApplication.find({ jobId: job._id });
        return {
          ...job.toObject(),
          applicants: applicants, // return actual array for flexibility
          applicantCount: applicants.length, // include count separately
        };
      })
    );

    res.json({ success: true, jobsData });
  } catch (error) {
    console.error("❌ Error fetching company jobs:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ✅ Change job application status
export const ChangeJobApplicationsStatus = async (req, res) => {

  try {

      const { id, status } = req.body;

    // Find job applications and update status

    await JobApplication.findOneAndUpdate({_id: id},{status})

    res.json({success:true, message:'Status changed'})
    
  } catch (error) {

    res.json({ success:false, message: error.message})
    
  }

  

}

// ✅ Change job visibility (show/hide)
export const changeVisibility = async (req, res) => {
  try {
    const { id } = req.body;
    const companyId = req.company._id;

    const job = await Job.findById(id);
    if (!job) {
      return res.json({ success: false, message: "Job not found" });
    }

    if (companyId.toString() !== job.companyId.toString()) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    job.visible = !job.visible;
    await job.save();

    res.json({ success: true, job });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
