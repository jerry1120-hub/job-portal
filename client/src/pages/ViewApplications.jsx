import React, { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "../components/Loading";

const defaultUserImage = "https://via.placeholder.com/40";

const ViewApplications = () => {
  const { backendUrl, companyToken } = useContext(AppContext);
  const [applicants, setApplicants] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const fetchCompanyJobApplicants = async () => {
    if (!companyToken) return;

    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/company/applicants`, {
        headers: { token: companyToken },
      });
      if (data.success) setApplicants(data.applications.reverse());
      else {
        setApplicants([]);
        toast.error(data.message);
      }
    } catch (error) {
      setApplicants([]);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to update Job Application Status
  const changeJobApplicationStatus = async (id, status) => {
    try {
      // Update locally first
      setApplicants((prev) =>
        prev.map((app) => (app._id === id ? { ...app, status: status } : app))
      );

      const { data } = await axios.post(
        backendUrl + "/api/company/change-status",
        { id, status },
        { headers: { token: companyToken } }
      );

      if (!data.success) toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchCompanyJobApplicants();
  }, [companyToken]);

  if (loading || applicants === null) return <Loading />;
  if (applicants.length === 0)
    return <div className="text-center mt-8">No applications found.</div>;

  return (
    <div className="container mx-auto p-4">
      <table className="w-full max-w-4xl bg-white border border-gray-200 max-sm:text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 px-4 text-left">#</th>
            <th className="py-2 px-4 text-left">User name</th>
            <th className="py-2 px-4 text-left max-sm:hidden">Job Title</th>
            <th className="py-2 px-4 text-left max-sm:hidden">Location</th>
            <th className="py-2 px-4 text-left">Resume</th>
            <th className="py-2 px-4 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {applicants
            .filter((item) => item.jobId && item.userId)
            .map((applicant, index) => (
              <tr key={index} className="text-gray-700">
                <td className="py-2 px-4 border-b text-center">{index + 1}</td>
                <td className="py-2 px-4 border-b text-center flex items-center">
                  <img
                    className="w-10 h-10 rounded-full mr-3 max-sm:hidden"
                    src={applicant.userId?.image || defaultUserImage}
                    alt={applicant.userId?.name || "Unknown User"}
                  />
                  <span>{applicant.userId?.name || "Unknown User"}</span>
                </td>
                <td className="py-2 px-4 border-b max-sm:hidden">{applicant.jobId.title}</td>
                <td className="py-2 px-4 border-b max-sm:hidden">{applicant.jobId.location}</td>
                <td className="py-2 px-4 border-b">
                  {applicant.userId?.resume ? (
                    <button
                      className="bg-blue-50 text-blue-400 px-3 py-1 rounded inline-flex gap-2 items-center"
                      onClick={() => setSelectedApplicant(applicant)}
                    >
                      Resume <img src={assets.resume_download_icon} alt="download" />
                    </button>
                  ) : (
                    <span className="text-gray-400">No Resume</span>
                  )}
                </td>

                {/* Action */}
                <td className="py-2 px-4 border-b relative group">
                  {applicant.status === "Pending" ? (
                    <>
                      <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                        <button
                          onClick={() => changeJobApplicationStatus(applicant._id, "Accepted")}
                          className="block w-full text-left px-4 py-2 text-blue-500 hover:bg-gray-100"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => changeJobApplicationStatus(applicant._id, "Rejected")}
                          className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                        >
                          Reject
                        </button>
                      </div>
                      <button className="text-gray-500 px-2 py-1 rounded hover:bg-gray-100">
                        ...
                      </button>
                    </>
                  ) : (
                    <div>{applicant.status}</div>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-96 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 font-bold"
              onClick={() => setSelectedApplicant(null)}
            >
              X
            </button>
            <h2 className="text-lg font-bold mb-4">Applicant Details</h2>
            <div className="flex items-center mb-4">
              <img
                src={selectedApplicant.userId?.image || defaultUserImage}
                alt={selectedApplicant.userId?.name}
                className="w-16 h-16 rounded-full mr-4"
              />
              <div>
                <p className="font-semibold">{selectedApplicant.userId?.name}</p>
                <p className="text-gray-500">{selectedApplicant.userId?.email}</p>
              </div>
            </div>
            <p>
              <span className="font-semibold">Job:</span> {selectedApplicant.jobId?.title}
            </p>
            <p>
              <span className="font-semibold">Location:</span> {selectedApplicant.jobId?.location}
            </p>
            <p className="mt-2">
              <span className="font-semibold">Resume:</span>{" "}
              {selectedApplicant.userId?.resume ? (
                <a
                  className="text-blue-500 underline"
                  href={selectedApplicant.userId.resume}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Resume
                </a>
              ) : (
                "No Resume"
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewApplications;
