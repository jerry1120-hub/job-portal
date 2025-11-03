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
        setJobs(data.jobs);
        console.log("✅ Jobs fetched:", data.jobs);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Fetch company data
  const fetchCompanyData = async () => {
    if (!companyToken) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/company/company`, {
        headers: { token: companyToken },
      });
      if (data.success) setCompanyData(data.company);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ❌ Remove registerUserIfNeeded() – handled by backend /user route now
  // The backend automatically registers users if not found.

  // ✅ Fetch user data (and auto-register if missing)
  const fetchUserData = async () => {
    if (!user) return;
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/users/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUserData(data.user);
        console.log("✅ User data:", data.user);
      } else {
        toast.error(data.message);
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
      const { data } = await axios.get(`${backendUrl}/api/users/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUserApplications(data.userApplications);
        console.log("✅ User applications:", data.userApplications);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("❌ Fetch user applications error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ✅ On first load, fetch jobs & company token
  useEffect(() => {
    fetchJobs();
    const storedCompanyToken = localStorage.getItem("companyToken");
    if (storedCompanyToken) setCompanyToken(storedCompanyToken);
  }, []);

  // ✅ When company token changes
  useEffect(() => {
    fetchCompanyData();
  }, [companyToken]);

  // ✅ When user logs in, fetch user data and applications
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
    setSearchFilter,
    searchFilter,
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
    backendUrl,
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
