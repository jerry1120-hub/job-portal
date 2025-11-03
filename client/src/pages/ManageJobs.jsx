import React, { useContext, useEffect, useState } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const ManageJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState(false); // default false to indicate loading
  const { backendUrl, companyToken } = useContext(AppContext);

  // ✅ Fetch company job data
  const fetchCompanyJobs = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/company/list-jobs`, {
        headers: { token: companyToken },
      });

      if (data.success) {
        const reversedJobs = data.jobsData.reverse();
        setJobs(reversedJobs);
        console.log("📦 Jobs fetched:", reversedJobs);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.error("❌ Fetch error:", error);
    }
  };

  // Function to change Job visibility
  const changeJobVisibility = async (id) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/company/change-visibility",
        { id },
        { headers: { token: companyToken } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchCompanyJobs();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (companyToken) {
      fetchCompanyJobs();
    } else {
      console.warn("⚠️ No company token found");
    }
  }, [companyToken]);

  // ✅ Corrected return
  if (jobs === false) {
    // Still loading
    return <div className="text-center py-4 text-gray-500">Loading jobs...</div>;
  }

  if (jobs.length === 0 ) {
    // No jobs found
    return <div className="text-center py-4 text-gray-500">No jobs found.</div>;
  }

  return (
    <div className="container p-4 max-w-5xl">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 max-sm:text-sm">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left max-sm:hidden">#</th>
              <th className="py-2 px-4 border-b text-left">Job Title</th>
              <th className="py-2 px-4 border-b text-left max-sm:hidden">Date</th>
              <th className="py-2 px-4 border-b text-left max-sm:hidden">Location</th>
              <th className="py-2 px-4 border-b text-center">Applicants</th>
              <th className="py-2 px-4 border-b text-left">Visible</th>
            </tr>
          </thead>

          <tbody>
            {jobs.map((job, index) => (
              <tr key={job._id || index} className="text-gray-700">
                <td className="py-2 px-4 border-b max-sm:hidden">{index + 1}</td>
                <td className="py-2 px-4 border-b">{job.title}</td>
                <td className="py-2 px-4 border-b max-sm:hidden">
                  {moment(job.date).format("ll")}
                </td>
                <td className="py-2 px-4 border-b max-sm:hidden">{job.location}</td>
                <td className="py-2 px-4 border-b text-center">{job.applicants?.length || 0}</td>
                <td className="py-2 px-4 border-b">
                  <input
                    type="checkbox"
                    className="scale-125 ml-4"
                    checked={job.visible}
                    readOnly
                    onChange={() => changeJobVisibility(job._id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => navigate("/dashboard/add-job")}
          className="bg-black text-white py-2 px-4 rounded"
        >
          Add new job
        </button>
      </div>
    </div>
  );
};

export default ManageJobs;
