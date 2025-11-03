import React, { useContext, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { companyData, setCompanyData, setCompanyToken } = useContext(AppContext);

  // ✅ Logout function
  const logout = () => {
    setCompanyToken(null);
    localStorage.removeItem("companyToken");
    setCompanyData(null);
    navigate("/");
  };

  // ✅ Redirect only if currently on /dashboard (prevents override)
  useEffect(() => {
    if (companyData && window.location.pathname === "/dashboard") {
      navigate("/dashboard/manage-jobs");
    }
  }, [companyData, navigate]);

  // ✅ Protect route: if no companyData, redirect to login
  useEffect(() => {
    if (!companyData) {
      navigate("/company-login");
    }
  }, [companyData, navigate]);

  return (
    <div className="min-h-screen">
      {/* ✅ Navbar */}
      <div className="shadow py-4">
        <div className="px-5 flex justify-between items-center">
          <img
            onClick={() => navigate("/")}
            className="max-sm:w-32 cursor-pointer"
            src={assets.logo}
            alt="Logo"
          />

          {companyData && (
            <div className="flex items-center gap-3">
              <p className="max-sm:hidden">Welcome, {companyData.name}</p>

              <div className="relative group">
                <img
                  className="w-8 h-8 border rounded-full object-cover"
                  src={companyData.image}
                  alt="Company avatar"
                />
                <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-12">
                  <ul className="bg-white border rounded-md text-sm p-2 shadow">
                    <li
                      onClick={logout}
                      className="py-1 px-2 cursor-pointer hover:bg-gray-100 rounded"
                    >
                      Logout
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Sidebar + Main Content */}
      <div className="flex items-start">
        {/* Sidebar */}
        <div className="inline-block min-h-screen border-r-2">
          <ul className="flex flex-col items-start pt-5 text-gray-800">
            <NavLink
              to="/dashboard/add-job"
              className={({ isActive }) =>
                `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${
                  isActive ? "bg-blue-100 border-r-4 border-blue-500" : ""
                }`
              }
            >
              <img className="w-4" src={assets.add_icon} alt="Add Job" />
              <p className="max-sm:hidden">Add Job</p>
            </NavLink>

            <NavLink
              to="/dashboard/manage-jobs"
              className={({ isActive }) =>
                `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${
                  isActive ? "bg-blue-100 border-r-4 border-blue-500" : ""
                }`
              }
            >
              <img className="w-4" src={assets.home_icon} alt="Manage Jobs" />
              <p className="max-sm:hidden">Manage Jobs</p>
            </NavLink>

            <NavLink
              to="/dashboard/view-applications"
              className={({ isActive }) =>
                `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${
                  isActive ? "bg-blue-100 border-r-4 border-blue-500" : ""
                }`
              }
            >
              <img className="w-4" src={assets.person_tick_icon} alt="View Applications" />
              <p className="max-sm:hidden">View Applications</p>
            </NavLink>
          </ul>
        </div>

        {/* Main Dashboard Content */}
        <div className="flex-1 h-full p-2 p-5">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
