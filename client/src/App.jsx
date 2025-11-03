import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom"; // ✅ added Navigate
import Home from "./pages/Home";
import ApplyJob from "./pages/ApplyJob";
import Applications from "./pages/Applications";
import RecruiterLogin from "./components/RecruiterLogin";
import { AppContext } from "./context/AppContext";
import Dashboard from "./pages/Dashboard";
import AddJob from "./pages/AddJob";
import ManageJobs from "./pages/ManageJobs";
import ViewApplications from "./pages/ViewApplications";
import 'quill/dist/quill.snow.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const { showRecruiterLogin, companyToken } = useContext(AppContext);

  return (
    <div>
      {showRecruiterLogin && <RecruiterLogin />}
      <ToastContainer />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/apply-jobs/:id" element={<ApplyJob />} />
        <Route path="/applications" element={<Applications />} />

        {/* ✅ Dashboard route setup */}
        <Route
          path="/dashboard/*" // ✅ must include /* to support nested routes
          element={
            companyToken ? <Dashboard /> : <Navigate to="/" replace />
          }
        >
          {/* ✅ nested routes */}
          <Route path="add-job" element={<AddJob />} />
          <Route path="manage-jobs" element={<ManageJobs />} />
          <Route path="view-applications" element={<ViewApplications />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
