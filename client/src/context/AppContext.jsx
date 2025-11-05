import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/clerk-react";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { user } = useUser();
  const { getToken } = useAuth();

  const [searchFilter, setSearchFilter] = useState({ title: "", location: "" });
  const [isSearched, setIsSearched] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [showRecruiterLogin, setShowRecruiterLogin] = useState(false);
  const [companyToken, setCompanyToken] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userApplications, setUserApplications] = useState([]);

  // ✅ Fetch all jobs
  const fetchJobs = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/jobs`);
      if (data.success) {
        setJobs(data.jobs || []);
        console.log("✅ Jobs fetched:", data.jobs);
      } else {
        toast.error(data.message || "Failed to load jobs");
      }
    } catch (error) {
      console.error("❌ Jobs fetch error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ✅ Fetch company data
  const fetchCompanyData = async () => {
    if (!companyToken) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/company/company`, {
        headers: { token: companyToken },
      });
      if (data.success) {
        setCompanyData(data.company);
      } else {
        toast.error(data.message || "Failed to load company data");
      }
    } catch (error) {
      console.error("❌ Company data error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ✅ Fetch user data
  const fetchUserData = async () => {
    if (!user) return;
    try {
      const token = await getToken();
      if (!token) return;

      const { data } = await axios.get(`${backendUrl}/api/user/data`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success && data.user) {
        setUserData(data.user);
        console.log("✅ User data:", data.user);
      } else {
        toast.error(data.message || "User data not found");
      }
    } catch (error) {
      console.error("❌ Fetch user data error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ✅ Fetch user job applications
  const fetchUserApplications = async () => {
    if (!user) return;
    try {
      const token = await getToken();
      if (!token) return;

      const { data } = await axios.get(`${backendUrl}/api/user/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("📦 Full applications API response:", data);

      if (data.success && Array.isArray(data.userApplications)) {
        setUserApplications(data.userApplications);
        console.log("✅ User applications:", data.userApplications);
      } else if (data.success && Array.isArray(data.applications)) {
        // In case backend uses "applications" instead of "userApplications"
        setUserApplications(data.applications);
        console.log("✅ User applications (fallback):", data.applications);
      } else {
        setUserApplications([]);
        console.warn("⚠️ No applications array found in response:", data);
      }
    } catch (error) {
      console.error("❌ Fetch user applications error:", error);
      toast.error(error.response?.data?.message || error.message);
      setUserApplications([]); // ensure it's always an array
    }
  };

  // ✅ On first load
  useEffect(() => {
    fetchJobs();
    const storedCompanyToken = localStorage.getItem("companyToken");
    if (storedCompanyToken) setCompanyToken(storedCompanyToken);
  }, []);

  // ✅ When company token changes
  useEffect(() => {
    fetchCompanyData();
  }, [companyToken]);

  // ✅ When user logs in/out
  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchUserApplications();
    } else {
      setUserData(null);
      setUserApplications([]);
    }
  }, [user]);

  const value = {
    backendUrl,
    searchFilter,
    setSearchFilter,
    isSearched,
    setIsSearched,
    jobs,
    setJobs,
    showRecruiterLogin,
    setShowRecruiterLogin,
    companyToken,
    setCompanyToken,
    companyData,
    setCompanyData,
    userData,
    setUserData,
    userApplications,
    setUserApplications,
    fetchUserData,
    fetchUserApplications,
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};
