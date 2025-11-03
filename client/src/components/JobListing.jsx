import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { assets, JobCategories, JobLocations } from "../assets/assets";
import JobCard from "./JobCard";

const JobListing = () => {
  const { isSearched, searchFilter, setSearchFilter, jobs } = useContext(AppContext);

  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [filterJobs, setFilterJobs] = useState([]);

  const jobsPerPage = 6; // 6 jobs per page

  // ✅ Handle category selection
  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  // ✅ Handle location selection
  const handleLocationChange = (location) => {
    setSelectedLocations((prev) =>
      prev.includes(location) ? prev.filter((l) => l !== location) : [...prev, location]
    );
  };

  // ✅ Filter jobs safely
  useEffect(() => {
    if (!jobs || jobs.length === 0) {
      setFilterJobs([]);
      return;
    }

    let filtered = [...jobs].reverse(); // show latest first

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((job) =>
        job.category && selectedCategories.includes(job.category)
      );
    }

    if (selectedLocations.length > 0) {
      filtered = filtered.filter((job) =>
        job.location && selectedLocations.includes(job.location)
      );
    }

    if (searchFilter.title) {
      filtered = filtered.filter(
        (job) => job.title && job.title.toLowerCase().includes(searchFilter.title.toLowerCase())
      );
    }

    if (searchFilter.location) {
      filtered = filtered.filter(
        (job) => job.location && job.location.toLowerCase().includes(searchFilter.location.toLowerCase())
      );
    }

    setFilterJobs(filtered);
    setCurrentPage(1); // reset page when filter changes
  }, [jobs, selectedCategories, selectedLocations, searchFilter]);

  // ✅ Pagination
  const totalPages = Math.ceil(filterJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const currentJobs = filterJobs.slice(startIndex, startIndex + jobsPerPage);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  return (
    <div className="container 2xl:px-20 mx-auto flex flex-col lg:flex-row max-lg:space-y-8 py-8">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-1/4 px-4 bg-white rounded-lg shadow-sm">
        {/* Active Search Filters */}
        {isSearched && (searchFilter.title || searchFilter.location) && (
          <>
            <h3 className="font-semibold text-lg mb-4">Current Search</h3>
            <div className="mb-4 text-gray-600 flex flex-wrap gap-2">
              {searchFilter.title && (
                <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded">
                  {searchFilter.title}
                  <img
                    onClick={() => setSearchFilter((prev) => ({ ...prev, title: "" }))}
                    className="cursor-pointer w-4 h-4"
                    src={assets.cross_icon}
                    alt="clear title"
                  />
                </span>
              )}
              {searchFilter.location && (
                <span className="inline-flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-1.5 rounded">
                  {searchFilter.location}
                  <img
                    onClick={() => setSearchFilter((prev) => ({ ...prev, location: "" }))}
                    className="cursor-pointer w-4 h-4"
                    src={assets.cross_icon}
                    alt="clear location"
                  />
                </span>
              )}
            </div>
          </>
        )}

        {/* Toggle Filters on Mobile */}
        <button
          onClick={() => setShowFilter((prev) => !prev)}
          className="px-6 py-1.5 mb-4 rounded border border-gray-400 lg:hidden"
        >
          {showFilter ? "Close Filters" : "Show Filters"}
        </button>

        {/* Category Filter */}
        <div className={showFilter ? "" : "max-lg:hidden"}>
          <h4 className="font-semibold text-lg py-4">Filter by Categories</h4>
          <ul className="space-y-3 text-gray-700">
            {JobCategories.map((category, index) => (
              <li className="flex gap-3 items-center" key={index}>
                <input
                  className="scale-125"
                  type="checkbox"
                  onChange={() => handleCategoryChange(category)}
                  checked={selectedCategories.includes(category)}
                />
                <label>{category}</label>
              </li>
            ))}
          </ul>
        </div>

        {/* Location Filter */}
        <div className={showFilter ? "" : "max-lg:hidden"}>
          <h4 className="font-semibold text-lg py-4 pt-10">Filter by Location</h4>
          <ul className="space-y-3 text-gray-700">
            {JobLocations.map((location, index) => (
              <li className="flex gap-3 items-center" key={index}>
                <input
                  className="scale-125"
                  type="checkbox"
                  onChange={() => handleLocationChange(location)}
                  checked={selectedLocations.includes(location)}
                />
                <label>{location}</label>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main Job Listings */}
      <main className="w-full lg:w-3/4 text-gray-800 max-lg:px-4">
        <h3 className="font-semibold text-3xl py-2">Latest Jobs</h3>
        <p className="mb-8 text-gray-500">Get your desired job from top companies</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {currentJobs.length > 0 ? (
            currentJobs.map((job, index) => {
              const jobIndex = (currentPage - 1) * jobsPerPage + index + 1;
              return <JobCard key={job._id || index} job={job} index={jobIndex} />;
            })
          ) : (
            <p className="text-center text-gray-500 col-span-full py-10">No jobs found.</p>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-10">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`flex items-center justify-center w-10 h-10 border rounded hover:bg-gray-100 transition ${
                currentPage === 1 ? "opacity-40 cursor-not-allowed" : ""
              }`}
            >
              <img src={assets.left_arrow_icon} alt="Previous" className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`w-10 h-10 flex items-center justify-center border rounded text-sm font-medium transition ${
                  currentPage === index + 1
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`flex items-center justify-center w-10 h-10 border rounded hover:bg-gray-100 transition ${
                currentPage === totalPages ? "opacity-40 cursor-not-allowed" : ""
              }`}
            >
              <img src={assets.right_arrow_icon} alt="Next" className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default JobListing;
