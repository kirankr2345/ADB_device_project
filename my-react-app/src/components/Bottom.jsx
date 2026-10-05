import React, { useEffect, useState } from "react";
import Card from "./Card";
import { api, getCurrentUser } from "../api";
import { 
  IoSearchOutline, 
  IoFunnelOutline, 
  IoBookmarkOutline, 
  IoBriefcaseOutline,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoCloseOutline,
  IoAddCircleOutline,
  IoPersonOutline,
  IoDocumentTextOutline,
  IoCalendarOutline,
  IoSendOutline
} from "react-icons/io5";

const Bottom = ({ activeTab = "jobs", searchFilters = {}, onOpenPostJob = () => {} }) => {
  const currentUser = getCurrentUser();
  const role = currentUser?.role || "candidate";

  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters state
  const [search, setSearch] = useState(searchFilters.search || "");
  const [location, setLocation] = useState(searchFilters.location || "");
  const [workMode, setWorkMode] = useState("all");
  const [jobType, setJobType] = useState("all");
  const [category, setCategory] = useState("all");

  // Recruiter applicant inspection modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [updateStatus, setUpdateStatus] = useState("");
  const [statusComment, setStatusComment] = useState("");
  const [updating, setUpdating] = useState(false);

  // Sync external hero search
  useEffect(() => {
    if (searchFilters.search !== undefined) setSearch(searchFilters.search);
    if (searchFilters.location !== undefined) setLocation(searchFilters.location);
  }, [searchFilters]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [compRes, jobRes, catRes] = await Promise.all([
        api.getCompanies(),
        api.getJobs({
          search: search.trim(),
          location: location.trim(),
          work_mode: workMode !== "all" ? workMode : "",
          job_type: jobType !== "all" ? jobType : "",
          category: category !== "all" ? category : "",
        }),
        api.getCategories(),
      ]);

      setCompanies(Array.isArray(compRes.data) ? compRes.data : []);
      setJobs(Array.isArray(jobRes.data?.results) ? jobRes.data.results : []);
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);

      if (currentUser?.id) {
        const [savedRes, appsRes] = await Promise.all([
          api.getSavedJobs(currentUser.id),
          api.getApplications({ user_id: currentUser.id }),
        ]);
        setSavedJobs(Array.isArray(savedRes.data) ? savedRes.data : []);
        setApplications(Array.isArray(appsRes.data) ? appsRes.data : []);
      }
    } catch (err) {
      console.error("Error loading jobs data:", err);
      setError("Failed to load jobs. Please check that backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, location, workMode, jobType, category, activeTab]);

  const savedJobIds = new Set(savedJobs.map((sj) => sj.job?.id || sj.job));
  const appliedJobIds = new Set(applications.map((app) => app.job?.id || app.job));

  const handleUpdateApplicationStatus = async (appId) => {
    if (!updateStatus) return;
    setUpdating(true);
    try {
      await api.updateApplicationStatus(appId, {
        status: updateStatus,
        comment: statusComment,
        user_id: currentUser?.id,
      });
      setSelectedApp(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <section id="jobs-feed" className="w-full bg-slate-950 px-4 py-12 sm:px-6 lg:px-10 min-h-screen">
      <div className="mx-auto max-w-7xl">

        {/* Tab Title Header */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-white/10 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
              {activeTab === "jobs" && "Explore Opportunities"}
              {activeTab === "saved" && "Bookmarked Roles"}
              {activeTab === "applications" && "Track Your Progress"}
              {activeTab === "recruiter" && "Manage Job Listings & Applicants"}
            </p>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              {activeTab === "jobs" && `${jobs.length} Open Positions`}
              {activeTab === "saved" && `${savedJobs.length} Saved Jobs`}
              {activeTab === "applications" && `${applications.length} Submitted Applications`}
              {activeTab === "recruiter" && "Recruiter Management"}
            </h2>
          </div>

          {role === "recruiter" && (
            <button
              onClick={onOpenPostJob}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/30 transition hover:scale-[1.02]"
            >
              <IoAddCircleOutline className="text-xl" />
              Post New Job
            </button>
          )}
        </div>

        {/* Filters Bar (Only on Jobs tab) */}
        {activeTab === "jobs" && (
          <div className="mb-10 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Keyword Search Input */}
              <div className="flex-1 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-sm text-white">
                <IoSearchOutline className="text-cyan-400 text-lg shrink-0" />
                <input
                  type="text"
                  placeholder="Filter by title, skill, or keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent outline-none placeholder-slate-500"
                />
              </div>

              {/* Location Input */}
              <div className="w-full md:w-64 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-sm text-white">
                <IoFunnelOutline className="text-cyan-400 text-lg shrink-0" />
                <input
                  type="text"
                  placeholder="Filter location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-transparent outline-none placeholder-slate-500"
                />
              </div>

              {/* Category Dropdown */}
              <div className="w-full md:w-56">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-sm text-white outline-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-3">
              
              {/* Work Mode Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
                <span className="text-slate-400 mr-1">Work Mode:</span>
                {["all", "onsite", "remote", "hybrid"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setWorkMode(mode)}
                    className={`rounded-lg px-3 py-1.5 capitalize transition ${
                      workMode === mode
                        ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                        : "bg-slate-800 text-slate-300 hover:text-white"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Job Type Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
                <span className="text-slate-400 mr-1">Job Type:</span>
                {["all", "full_time", "part_time", "internship", "contract"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setJobType(type)}
                    className={`rounded-lg px-3 py-1.5 capitalize transition ${
                      jobType === type
                        ? "bg-blue-600 text-white font-bold shadow-md"
                        : "bg-slate-800 text-slate-300 hover:text-white"
                    }`}
                  >
                    {type.replaceAll("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading & Error States */}
        {loading && (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
            <p className="mt-3 text-sm text-slate-400">Loading listings...</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center text-rose-300">
            <p className="font-bold">{error}</p>
          </div>
        )}

        {/* Jobs Tab Content */}
        {!loading && !error && activeTab === "jobs" && (
          <>
            {jobs.length === 0 ? (
              <div className="py-20 text-center rounded-3xl border border-white/5 bg-slate-900/30 p-8">
                <IoBriefcaseOutline className="mx-auto text-5xl text-slate-600 mb-3" />
                <h3 className="text-xl font-bold text-white">No jobs found matching your filters</h3>
                <p className="mt-2 text-sm text-slate-400">Try adjusting your search criteria or work mode filter.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {jobs.map((job) => (
                  <Card
                    key={job.id}
                    company={job.company || {}}
                    job={job}
                    isSaved={savedJobIds.has(job.id)}
                    isApplied={appliedJobIds.has(job.id)}
                    onToggleSave={() => fetchData()}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Saved Jobs Tab */}
        {!loading && !error && activeTab === "saved" && (
          <>
            {savedJobs.length === 0 ? (
              <div className="py-20 text-center rounded-3xl border border-white/5 bg-slate-900/30 p-8">
                <IoBookmarkOutline className="mx-auto text-5xl text-slate-600 mb-3" />
                <h3 className="text-xl font-bold text-white">No saved jobs yet</h3>
                <p className="mt-2 text-sm text-slate-400">Click the bookmark icon on any job card to save it for later.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {savedJobs.map((sj) => {
                  const j = sj.job_detail || sj.job;
                  return (
                    <Card
                      key={sj.id}
                      company={j?.company || {}}
                      job={j}
                      isSaved={true}
                      isApplied={appliedJobIds.has(j?.id)}
                      onToggleSave={() => fetchData()}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Applications Tab (Candidate View) */}
        {!loading && !error && activeTab === "applications" && (
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="py-20 text-center rounded-3xl border border-white/5 bg-slate-900/30 p-8">
                <IoBriefcaseOutline className="mx-auto text-5xl text-slate-600 mb-3" />
                <h3 className="text-xl font-bold text-white">You haven't submitted any job applications yet</h3>
                <p className="mt-2 text-sm text-slate-400">Browse open positions and click "View & Apply" to get started.</p>
              </div>
            ) : (
              applications.map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-lg backdrop-blur-xl"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-white">{app.job_detail?.title || "Position"}</h3>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="mt-1 text-xs text-cyan-300">{app.job_detail?.company?.name || "Company"}</p>
                    <p className="mt-2 text-xs text-slate-400 line-clamp-2">{app.cover_letter || "No cover letter attached."}</p>
                  </div>

                  <div className="text-right text-xs text-slate-400 shrink-0">
                    <p>Applied on {new Date(app.applied_at).toLocaleDateString()}</p>
                    <p className="mt-1 font-mono text-[11px] text-slate-500">App ID: #{app.id}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Recruiter Tab */}
        {!loading && !error && activeTab === "recruiter" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Received Candidate Applications</h3>
            
            {applications.length === 0 ? (
              <div className="py-20 text-center rounded-3xl border border-white/5 bg-slate-900/30 p-8">
                <IoPersonOutline className="mx-auto text-5xl text-slate-600 mb-3" />
                <h3 className="text-xl font-bold text-white">No applications received yet</h3>
                <p className="mt-2 text-sm text-slate-400">Applications submitted by candidates will appear here.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/90 p-5 shadow-xl"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-bold text-white">
                          Candidate #{app.candidate_detail?.user_detail?.username || app.candidate}
                        </h4>
                        <StatusBadge status={app.status} />
                      </div>
                      <p className="mt-1 text-sm font-semibold text-cyan-300">
                        Job: {app.job_detail?.title}
                      </p>
                      <p className="mt-2 text-xs text-slate-300 italic">
                        "{app.cover_letter || "No cover letter"}"
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setUpdateStatus(app.status);
                          setStatusComment("");
                        }}
                        className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition"
                      >
                        Review Candidate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recruiter Review Modal */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold text-white">Review Candidate Application</h3>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="rounded-lg p-1 text-slate-400 hover:text-white"
                >
                  <IoCloseOutline className="text-2xl" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-slate-300">
                <p><strong className="text-white">Applicant:</strong> {selectedApp.candidate_detail?.user_detail?.username || selectedApp.candidate}</p>
                <p><strong className="text-white">Applied Job:</strong> {selectedApp.job_detail?.title}</p>
                <p><strong className="text-white">Cover Letter:</strong></p>
                <div className="rounded-xl bg-slate-950 p-4 text-xs leading-5 text-slate-300 border border-slate-800">
                  {selectedApp.cover_letter || "None provided"}
                </div>
              </div>

              {/* Status change form */}
              <div className="space-y-3 border-t border-slate-800 pt-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Update Application Status
                </label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="applied">Applied</option>
                  <option value="reviewing">Under Review</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview">Interview Scheduled</option>
                  <option value="selected">Selected / Offer Extended</option>
                  <option value="rejected">Rejected</option>
                </select>

                <input
                  type="text"
                  placeholder="Add feedback comment for candidate..."
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder-slate-500"
                />

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedApp(null)}
                    className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handleUpdateApplicationStatus(selectedApp.id)}
                    className="rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-50"
                  >
                    {updating ? "Saving..." : "Save Status"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    applied: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    reviewing: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    shortlisted: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    interview: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    selected: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    rejected: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  };
  const labels = {
    applied: "Applied",
    reviewing: "Under Review",
    shortlisted: "Shortlisted",
    interview: "Interview Scheduled",
    selected: "Selected / Offer",
    rejected: "Not Selected",
  };
  return (
    <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${styles[status] || "bg-slate-800 text-slate-300"}`}>
      {labels[status] || status}
    </span>
  );
};

export default Bottom;