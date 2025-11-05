import React, { useContext, useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { assets } from '../assets/assets';
import moment from "moment";
import Footer from '../components/Footer';
import { AppContext } from '../context/AppContext';
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Applications = () => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [isEdit, setIsEdit] = useState(false);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    backendUrl,
    userData,
    userApplications = [],
    fetchUserData,
    fetchUserApplications,
  } = useContext(AppContext);

  // ✅ Fetch applications on mount
  useEffect(() => {
    let isMounted = true;
    const loadApplications = async () => {
      try {
        if (fetchUserApplications) {
          await fetchUserApplications();
        } else {
          // Fallback: directly fetch if context function not available
          const token = await getToken();
          const { data } = await axios.get(`${backendUrl}/api/user/applications`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (data.success) setUserApplications(data.applications);
        }
      } catch (error) {
        console.error("Error loading applications:", error);
        toast.error("Failed to load applications");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadApplications();
    return () => {
      isMounted = false;
    };
  }, [fetchUserApplications, getToken, backendUrl]);

  // ✅ Update resume
  const updateResume = async () => {
    try {
      if (!resume) return toast.error("Please select a file first");

      const formData = new FormData();
      formData.append("resume", resume);

      const token = await getToken();

      const { data } = await axios.post(
        `${backendUrl}/api/user/update-resume`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        await fetchUserData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsEdit(false);
      setResume(null);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-[60vh] text-gray-500 text-lg">
          Loading your applications...
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container px-4 min-h-[65vh] 2xl:px-20 mx-auto my-10">
        <h2 className="text-xl font-semibold">Your Resume</h2>
        <div className="flex gap-2 mb-6 mt-3">
          {isEdit || (userData && userData.resume === "") ? (
            <>
              <label className="flex items-center" htmlFor="resumeUpload">
                <p className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg mr-2">
                  {resume ? resume.name : "Select Resume"}
                </p>
                <input
                  id="resumeUpload"
                  onChange={(e) => setResume(e.target.files[0])}
                  accept="application/pdf"
                  type="file"
                  hidden
                />
                <img src={assets.profile_upload_icon} alt="" />
              </label>
              <button
                onClick={updateResume}
                className="bg-green-100 border border-green-400 rounded-lg px-4 py-2"
              >
                Save
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              {userData?.resume ? (
                <a
                  className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg"
                  href={userData.resume}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Resume
                </a>
              ) : (
                <p className="text-gray-400">No resume uploaded</p>
              )}
              <button
                onClick={() => setIsEdit(true)}
                className="text-gray-500 border border-gray-300 rounded-lg px-4 py-2"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        <h2 className="text-xl font-semibold mb-4">Jobs Applied</h2>

        {!Array.isArray(userApplications) || userApplications.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            No job applications found.
          </p>
        ) : (
          <table className="min-w-full bg-white border rounded-lg">
            <thead>
              <tr>
                <th className="py-3 px-4 border-b text-left">Company</th>
                <th className="py-3 px-4 border-b text-left">Job Title</th>
                <th className="py-3 px-4 border-b text-left max-sm:hidden">
                  Location
                </th>
                <th className="py-3 px-4 border-b text-left max-sm:hidden">
                  Date
                </th>
                <th className="py-3 px-4 border-b text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {userApplications.map((job, index) => (
                <tr key={index}>
                  <td className="py-3 px-4 flex items-center gap-2 border-b">
                    <img
                      className="w-8 h-8"
                      src={job.companyId?.image || assets.company_icon}
                      alt=""
                    />
                    {job.companyId?.name || "Unknown"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {job.jobId?.title || "Job deleted"}
                  </td>
                  <td className="py-2 px-4 border-b max-sm:hidden">
                    {job.jobId?.location || "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b max-sm:hidden">
                    {moment(job.createdAt).format("ll")}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <span
                      className={`${
                        job.status === "Accepted"
                          ? "bg-green-100 text-green-600"
                          : job.status === "Rejected"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                      } px-4 py-1.5 rounded`}
                    >
                      {job.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Applications;
