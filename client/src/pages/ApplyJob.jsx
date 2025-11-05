import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import kconvert from "k-convert";
import moment from "moment";
import JobCard from "../components/JobCard";
import Footer from "../components/Footer";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "@clerk/clerk-react";

const ApplyJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken, userId } = useAuth();

  const [jobData, setJobData] = useState(null);
  const [isAlreadyApplied, setIsAlreadyApplied] = useState(false);
  const [updatedApplications, setUpdatedApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    jobs = [],
    backendUrl,
    userData,
    userApplications = [],
    fetchUserApplications,
    fetchUserData,
  } = useContext(AppContext);

  // ✅ Fetch job details
  const fetchJob = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/jobs/${id}`);
      if (data.success && data.job) {
        setJobData(data.job);
      } else {
        toast.error(data.message || "Job not found");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch job");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Apply for job
  const applyHandler = async () => {
    try {
      if (!userId) {
        toast.error("Please log in to apply for jobs");
        return;
      }

      if (!userData) {
        await fetchUserData?.();
      }

      if (!userData) {
        toast.error("User data not found. Please refresh or register first.");
        return;
      }

      if (!userData.resume) {
        toast.error("Please upload your resume before applying.");
        navigate("/applications");
        return;
      }

      const token = await getToken();
      if (!token) {
        toast.error("Authentication failed. Try logging in again.");
        return;
      }

      const { data } = await axios.post(
        `${backendUrl}/api/user/apply`,
        { jobId: jobData._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Applied successfully!");
        setIsAlreadyApplied(true);
        setUpdatedApplications((prev) => [
          ...prev,
          { jobId: { _id: jobData._id } },
        ]);
        fetchUserApplications?.();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("❌ applyHandler error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ✅ Check if already applied
  const checkAlreadyApplied = () => {
    if (!jobData) return;
    const hasApplied = userApplications.some(
      (item) => item?.jobId?._id === jobData._id
    );
    setIsAlreadyApplied(hasApplied);
  };

  // ✅ Auto fetch job on mount
  useEffect(() => {
    fetchJob();
  }, [id]);

  // ✅ Auto fetch user data if missing
  useEffect(() => {
    if (!userData && fetchUserData) {
      fetchUserData();
    }
  }, [userData]);

  // ✅ Check application status
  useEffect(() => {
    if (userApplications.length > 0 && jobData) {
      checkAlreadyApplied();
    }
  }, [jobData, userApplications]);

  if (loading) return <Loading />;
  if (!jobData)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl font-semibold text-gray-700">
          Job not found or deleted.
        </h2>
      </div>
    );

  const company = jobData?.companyId || {};

  const combinedApplications = [
    ...userApplications,
    ...updatedApplications,
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col py-10 container px-4 2xl:px-20 mx-auto">
        <div className="bg-white text-black rounded-lg w-full">
          <div className="flex justify-center md:justify-between flex-wrap gap-8 px-14 py-20 mb-6 bg-sky-400 rounded-xl">
            <div className="flex flex-col md:flex-row items-center">
              {company?.image && (
                <img
                  className="h-24 bg-white rounded-lg p-4 mr-4 max-md:mb-4 border"
                  src={company.image}
                  alt="Company"
                />
              )}
              <div className="text-center md:text-left text-neutral-700">
                <h1 className="text-2xl sm:text-4xl font-medium">
                  {jobData?.title || "Job"}
                </h1>
                <div className="flex flex-row flex-wrap max-md:justify-center gap-y-2 gap-6 items-center text-gray-600 mt-2">
                  <span className="flex items-center gap-1">
                    <img src={assets.suitcase_icon} alt="" />
                    {company?.name || "Company"}
                  </span>
                  <span className="flex items-center gap-1">
                    <img src={assets.location_icon} alt="" />
                    {jobData?.location || "Location"}
                  </span>
                  <span className="flex items-center gap-1">
                    <img src={assets.person_icon} alt="" />
                    {jobData?.level || "Level"}
                  </span>
                  <span className="flex items-center gap-1">
                    <img src={assets.money_icon} alt="" />
                    CTC: {kconvert.convertTo(jobData?.salary || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center text-end text-sm max-md:mx-auto max-md:text-center">
              <button
                onClick={applyHandler}
                disabled={isAlreadyApplied}
                className={`p-2.5 px-10 rounded text-white ${
                  isAlreadyApplied
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isAlreadyApplied ? "Already Applied" : "Apply Now"}
              </button>
              <p className="mt-1 text-gray-600">
                Posted {moment(jobData?.date).fromNow()}
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start">
            <div className="w-full lg:w-2/3">
              <h2 className="font-bold text-2xl mb-4">Job description</h2>
              <div
                className="rich-text"
                dangerouslySetInnerHTML={{
                  __html: jobData?.description || "",
                }}
              />
              <button
                onClick={applyHandler}
                disabled={isAlreadyApplied}
                className={`p-2.5 px-10 rounded mt-10 text-white ${
                  isAlreadyApplied
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isAlreadyApplied ? "Already Applied" : "Apply Now"}
              </button>
            </div>

            <div className="w-full lg:w-1/3 mt-8 lg:mt-0 lg:ml-8 space-y-5">
              <h2>More jobs from {company?.name || "this company"}</h2>
              {jobs
                .filter(
                  (job) =>
                    job._id !== jobData._id &&
                    job?.companyId?._id === company?._id
                )
                .filter((job) => {
                  const appliedJobIds = new Set(
                    combinedApplications.map(
                      (app) => app?.jobId && app.jobId._id
                    )
                  );
                  return !appliedJobIds.has(job._id);
                })
                .slice(0, 4)
                .map((job, index) => (
                  <JobCard key={index} job={job} />
                ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ApplyJob;
