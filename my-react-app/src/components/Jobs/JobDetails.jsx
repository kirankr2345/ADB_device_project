import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  IoArrowBack,
  IoBriefcaseOutline,
  IoCalendarOutline,
  IoCheckmarkCircle,
  IoCheckmarkCircleOutline,
  IoLocationOutline,
  IoPeopleOutline,
  IoTimeOutline,
  IoCashOutline,
  IoBookmarkOutline,
  IoBookmark,
  IoCloseOutline,
  IoDocumentAttachOutline,
  IoSendOutline,
  IoCloudUploadOutline
} from "react-icons/io5";
import { api, getMediaUrl, getCurrentUser } from "../../api";

const formatLabel = (value) => {
  if (!value) return "Not specified";
  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDate = (value) => {
  if (!value) return "Not specified";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
};

const formatSalary = (minimum, maximum) => {
  if (minimum == null && maximum == null) return "Salary negotiable";
  const formatAmount = (amount) => Number(amount).toLocaleString();
  if (minimum == null) return `Up to $${formatAmount(maximum)}`;
  if (maximum == null) return `From $${formatAmount(minimum)}`;
  return `$${formatAmount(minimum)} – $${formatAmount(maximum)}`;
};

const JobDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { jobId } = useParams();
  const currentUser = getCurrentUser();

  const [job, setJob] = useState(location.state?.job || null);
  const [loading, setLoading] = useState(!location.state?.job);
  const [isSaved, setIsSaved] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  // Apply Modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [applyMessage, setApplyMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    async function loadJobAndStatus() {
      try {
        if (!job && jobId) {
          const res = await api.getJobDetail(jobId);
          setJob(res.data);
        }

        if (currentUser?.id && jobId) {
          const [savedRes, appRes] = await Promise.all([
            api.getSavedJobs(currentUser.id),
            api.getApplications({ user_id: currentUser.id, job_id: jobId })
          ]);
          
          const savedList = Array.isArray(savedRes.data) ? savedRes.data : [];
          setIsSaved(savedList.some((s) => String(s.job?.id || s.job) === String(jobId)));

          const appList = Array.isArray(appRes.data) ? appRes.data : [];
          setIsApplied(appList.length > 0);

          // Load candidate resumes for application modal
          const resRes = await api.getResumes(currentUser.id);
          setResumes(Array.isArray(resRes.data) ? resRes.data : []);
          if (resRes.data?.length > 0) {
            setSelectedResumeId(resRes.data[0].id);
          }
        }
      } catch (err) {
        console.error("Error loading job details:", err);
      } finally {
        setLoading(false);
      }
    }

    loadJobAndStatus();
  }, [jobId, currentUser?.id]);

  const handleToggleBookmark = async () => {
    if (!currentUser?.id || !job?.id) return;
    try {
      if (isSaved) {
        await api.removeSavedJob(job.id, currentUser.id);
        setIsSaved(false);
      } else {
        await api.saveJob(job.id, currentUser.id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeFile(file);

    // Auto upload resume to backend
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name);
    formData.append("user_id", currentUser?.id);

    try {
      const res = await api.uploadResume(formData);
      setResumes((prev) => [...prev, res.data]);
      setSelectedResumeId(res.data.id);
    } catch (err) {
      console.error("Failed to upload resume file:", err);
    }
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!currentUser?.id) {
      setApplyMessage({ text: "Please log in to submit an application.", type: "error" });
      return;
    }

    setSubmitting(true);
    setApplyMessage({ text: "", type: "" });

    try {
      await api.submitApplication({
        job_id: job.id,
        user_id: currentUser.id,
        resume_id: selectedResumeId || null,
        cover_letter: coverLetter,
      });

      setApplyMessage({ text: "Application submitted successfully!", type: "success" });
      setIsApplied(true);
      setTimeout(() => setShowApplyModal(false), 1200);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to submit application. Try again.";
      setApplyMessage({ text: msg, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
          <p className="mt-3 text-sm text-slate-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <section className="w-full max-w-lg border-y border-white/10 py-10 text-center">
          <h1 className="text-2xl font-bold">Job Posting Not Found</h1>
          <p className="mt-2 text-sm text-slate-400">The job posting you are looking for does not exist or has been removed.</p>
          <button
            onClick={() => navigate("/main")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
          >
            <IoArrowBack />
            Back to Jobs Feed
          </button>
        </section>
      </main>
    );
  }

  const companyName = job.company?.name || "Company";
  const logoUrl = getMediaUrl(job.company?.logo);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header Bar */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg py-2 text-sm font-medium text-slate-300 transition hover:text-white"
          >
            <IoArrowBack />
            Back to Jobs
          </button>
          <span className="text-sm font-bold tracking-wide">
            Career <span className="text-cyan-400">Hub</span>
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <article>
          
          {/* Header Banner */}
          <header className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              
              <div className="flex items-start gap-4 min-w-0">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 text-2xl font-bold text-cyan-300 shadow-inner">
                  {logoUrl ? (
                    <img src={logoUrl} alt={`${companyName} logo`} className="h-full w-full object-cover" />
                  ) : (
                    companyName.trim().slice(0, 1).toUpperCase()
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-cyan-300">{companyName}</p>
                  <h1 className="mt-1 break-words text-2xl sm:text-3xl font-black leading-tight">
                    {job.title}
                  </h1>
                  <p className="mt-2 text-xs text-slate-400">
                    {job.category || "Technology"} • Posted {formatDate(job.created_at)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleToggleBookmark}
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
                    isSaved
                      ? "border-cyan-500/50 bg-cyan-500/20 text-cyan-300"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white"
                  }`}
                  title={isSaved ? "Remove Bookmark" : "Save Job"}
                >
                  {isSaved ? <IoBookmark className="text-lg" /> : <IoBookmarkOutline className="text-lg" />}
                </button>

                {isApplied ? (
                  <span className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 px-6 py-3 text-sm font-bold text-emerald-300">
                    <IoCheckmarkCircle className="text-lg" />
                    Applied
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(true)}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition hover:scale-[1.02]"
                  >
                    <IoSendOutline className="text-base" />
                    Apply Now
                  </button>
                )}
              </div>
            </div>

            {/* Badges row */}
            <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-800/80 pt-4">
              <span className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-300">
                {formatLabel(job.work_mode)}
              </span>
              <span className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-200">
                {formatLabel(job.job_type)}
              </span>
              <span className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-200">
                {job.experience ? `${job.experience} years exp` : "Entry level"}
              </span>
              <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-300">
                {formatSalary(job.salary_min, job.salary_max)}
              </span>
            </div>
          </header>

          {/* Grid Layout: Description & Overview */}
          <div className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
            
            {/* Left Description Column */}
            <section className="space-y-8">
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl">
                <h2 className="text-xl font-bold text-white mb-4">Job Description</h2>
                <p className="whitespace-pre-line text-sm leading-7 text-slate-300">
                  {job.description || "No detailed job description provided."}
                </p>
              </div>

              {/* Required Skills */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl">
                <h2 className="text-xl font-bold text-white mb-4">Required Skills</h2>
                {job.skills && job.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-xl bg-cyan-500/15 border border-cyan-500/30 px-4 py-2 text-xs font-semibold text-cyan-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No specific skills listed.</p>
                )}
              </div>
            </section>

            {/* Right Overview Sidebar */}
            <aside className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl h-fit space-y-5">
              <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Job Summary</h2>
              
              <dl className="grid gap-4 text-xs">
                <div className="flex items-start gap-3">
                  <IoBriefcaseOutline className="text-cyan-400 text-lg shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-slate-500 uppercase font-semibold text-[10px]">Job Type</dt>
                    <dd className="text-slate-200 font-bold mt-0.5">{formatLabel(job.job_type)}</dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <IoLocationOutline className="text-cyan-400 text-lg shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-slate-500 uppercase font-semibold text-[10px]">Work Mode & Location</dt>
                    <dd className="text-slate-200 font-bold mt-0.5">{formatLabel(job.work_mode)} ({job.location || "Remote"})</dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <IoTimeOutline className="text-cyan-400 text-lg shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-slate-500 uppercase font-semibold text-[10px]">Experience</dt>
                    <dd className="text-slate-200 font-bold mt-0.5">{job.experience ? `${job.experience} years` : "Not specified"}</dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <IoPeopleOutline className="text-cyan-400 text-lg shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-slate-500 uppercase font-semibold text-[10px]">Vacancies</dt>
                    <dd className="text-slate-200 font-bold mt-0.5">{job.vacancies || 1} open position(s)</dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <IoCashOutline className="text-cyan-400 text-lg shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-slate-500 uppercase font-semibold text-[10px]">Salary Range</dt>
                    <dd className="text-emerald-300 font-bold mt-0.5">{formatSalary(job.salary_min, job.salary_max)}</dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <IoCalendarOutline className="text-cyan-400 text-lg shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-slate-500 uppercase font-semibold text-[10px]">Application Deadline</dt>
                    <dd className="text-slate-200 font-bold mt-0.5">{formatDate(job.application_deadline)}</dd>
                  </div>
                </div>
              </dl>

              {!isApplied && (
                <button
                  type="button"
                  onClick={() => setShowApplyModal(true)}
                  className="mt-4 w-full rounded-xl bg-cyan-500 py-3 text-xs font-bold text-slate-950 transition hover:bg-cyan-300 shadow-md shadow-cyan-500/20"
                >
                  Apply for this position
                </button>
              )}
            </aside>

          </div>
        </article>
      </main>

      {/* Application Slide-over Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">Job Application</p>
                <h3 className="text-xl font-bold text-white mt-1">Apply for {job.title}</h3>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <IoCloseOutline className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleSubmitApplication} className="space-y-4">
              {/* Cover Letter input */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">Cover Letter / Note to Recruiter</label>
                <textarea
                  rows={4}
                  placeholder="Explain why you are a great fit for this position..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                />
              </div>

              {/* Resume selection or upload */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">Resume / CV</label>
                
                {resumes.length > 0 && (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="mb-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-3 text-sm text-white outline-none"
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title || `Resume #${r.id}`}
                      </option>
                    ))}
                  </select>
                )}

                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-950/50 p-4 text-xs font-semibold text-slate-300 transition hover:border-cyan-400 hover:text-white">
                  <IoCloudUploadOutline className="text-xl text-cyan-400" />
                  <span>{resumeFile ? resumeFile.name : "Upload new Resume (PDF / Doc)"}</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>
              </div>

              {/* Notification Banner */}
              {applyMessage.text && (
                <div
                  className={`rounded-xl p-3.5 text-xs font-medium ${
                    applyMessage.type === "success"
                      ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border border-rose-500/30 bg-rose-500/10 text-rose-300"
                  }`}
                >
                  {applyMessage.text}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="rounded-xl border border-slate-700 px-5 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.02] disabled:opacity-50"
                >
                  <IoSendOutline />
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default JobDetails;