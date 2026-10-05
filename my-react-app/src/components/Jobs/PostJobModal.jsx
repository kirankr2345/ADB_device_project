import React, { useState, useEffect } from "react";
import { IoCloseOutline, IoAddCircleOutline, IoBriefcaseOutline, IoCashOutline, IoLocationOutline } from "react-icons/io5";
import { api, getCurrentUser } from "../../api";

const PostJobModal = ({ isOpen, onClose, onJobPosted = () => {} }) => {
  const currentUser = getCurrentUser();

  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState("onsite");
  const [jobType, setJobType] = useState("full_time");
  const [experience, setExperience] = useState("1-3");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [vacancies, setVacancies] = useState("1");
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      api.getCompanies().then((res) => setCompanies(Array.isArray(res.data) ? res.data : []));
      api.getCategories().then((res) => setCategories(Array.isArray(res.data) ? res.data : []));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Job title and description are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.createJob({
        title,
        company_id: companyId || null,
        company_name: companyName || "Tech Company",
        category_name: categoryName,
        location,
        work_mode: workMode,
        job_type: jobType,
        experience,
        salary_min: salaryMin ? parseFloat(salaryMin) : null,
        salary_max: salaryMax ? parseFloat(salaryMax) : null,
        vacancies: parseInt(vacancies) || 1,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        description,
        user_id: currentUser?.id,
      });

      onJobPosted();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to create job posting. Check fields and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-purple-400">Recruiter Portal</p>
            <h3 className="text-2xl font-black text-white mt-1">Post a New Job Opening</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-white">
            <IoCloseOutline className="text-2xl" />
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 font-semibold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid gap-4 sm:grid-cols-2">
            
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Job Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Frontend Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Company Name</label>
              <input
                type="text"
                placeholder="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Category</label>
              <input
                type="text"
                placeholder="e.g. Software, Design, Marketing"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Work Mode</label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none"
              >
                <option value="onsite">Onsite</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Job Type</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none"
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Location</label>
              <input
                type="text"
                placeholder="e.g. Bengaluru, IN or Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Experience (Years)</label>
              <input
                type="text"
                placeholder="e.g. 2-4"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Min Salary ($)</label>
              <input
                type="number"
                placeholder="60000"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Max Salary ($)</label>
              <input
                type="number"
                placeholder="110000"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Required Skills (Comma-separated)</label>
              <input
                type="text"
                placeholder="React, Python, Django, PostgreSQL, Docker"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Job Description *</label>
              <textarea
                rows={5}
                required
                placeholder="Describe responsibilities, expectations, requirements, and benefits..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3.5 text-sm text-white outline-none"
              />
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 px-5 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-500/25 hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? "Publishing..." : "Publish Job"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default PostJobModal;
