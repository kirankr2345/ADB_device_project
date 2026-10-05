import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoCalendarOutline,
  IoGlobeOutline,
  IoLocationOutline,
  IoPeopleOutline,
  IoBookmarkOutline,
  IoBookmark,
  IoCashOutline,
  IoBriefcaseOutline,
  IoCheckmarkCircle
} from "react-icons/io5";
import { getMediaUrl, api, getCurrentUser } from "../api";

const formatDate = (value) => {
  if (!value) return "Date not listed";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const formatSalary = (min, max) => {
  if (!min && !max) return null;
  if (!min) return `$${Number(max).toLocaleString()}`;
  if (!max) return `$${Number(min).toLocaleString()}+`;
  return `$${Number(min).toLocaleString()} - $${Number(max).toLocaleString()}`;
};

const Card = ({ company = {}, job = null, isSaved = false, onToggleSave = () => {}, isApplied = false }) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const hasJob = Boolean(job?.id);
  const companyName = company.name || job?.company?.name || "Company";
  const logoUrl = getMediaUrl(company.logo || job?.company?.logo);
  const [savedState, setSavedState] = useState(isSaved);

  const handleBookmarkToggle = async (e) => {
    e.stopPropagation();
    if (!currentUser?.id || !job?.id) return;
    try {
      if (savedState) {
        await api.removeSavedJob(job.id, currentUser.id);
        setSavedState(false);
      } else {
        await api.saveJob(job.id, currentUser.id);
        setSavedState(true);
      }
      onToggleSave(job.id, !savedState);
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
    }
  };

  const openJob = () => {
    if (!hasJob) return;
    navigate(`/jobs/${job.id}`, {
      state: { job: { ...job, company: company.id ? company : job.company } },
    });
  };

  const salaryDisplay = formatSalary(job?.salary_min, job?.salary_max);

  return (
    <article 
      onClick={openJob}
      className="group relative flex h-full min-w-0 cursor-pointer flex-col rounded-2xl border border-white/10 bg-slate-900/80 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-[0_12px_30px_rgba(14,116,144,0.2)]"
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-700 bg-slate-800 text-lg font-bold text-cyan-300 shadow-inner">
            {logoUrl ? (
              <img src={logoUrl} alt={`${companyName} logo`} className="h-full w-full object-cover" />
            ) : (
              companyName.trim().slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold text-white group-hover:text-cyan-300 transition">{companyName}</h3>
            <p className="truncate text-xs text-slate-400">{company.industry || job?.category || "Technology"}</p>
          </div>
        </div>

        {/* Bookmark heart button */}
        {hasJob && (
          <button
            type="button"
            onClick={handleBookmarkToggle}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
              savedState
                ? "border-cyan-500/50 bg-cyan-500/20 text-cyan-300"
                : "border-slate-800 bg-slate-950/60 text-slate-500 hover:border-slate-700 hover:text-white"
            }`}
            title={savedState ? "Remove bookmark" : "Save job"}
          >
            {savedState ? <IoBookmark className="text-base" /> : <IoBookmarkOutline className="text-base" />}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mt-4 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-lg font-bold leading-snug text-white group-hover:text-cyan-200">
            {job?.title || "Company Profile"}
          </h4>
        </div>

        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">
          {job?.description || company.description || "No open roles listed."}
        </p>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-300">
          {job?.job_type && (
            <span className="rounded-lg border border-slate-700/60 bg-slate-800/80 px-2.5 py-1 text-slate-200">
              {job.job_type.replaceAll("_", " ")}
            </span>
          )}
          {job?.work_mode && (
            <span className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-cyan-300">
              {job.work_mode}
            </span>
          )}
          {job?.experience && (
            <span className="rounded-lg border border-slate-700/60 bg-slate-800/80 px-2.5 py-1 text-slate-300">
              {job.experience} yrs
            </span>
          )}
          {salaryDisplay && (
            <span className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-300 font-bold">
              <IoCashOutline />
              {salaryDisplay}
            </span>
          )}
        </div>
      </div>

      {/* Details list */}
      <dl className="my-4 grid gap-2.5 border-t border-white/10 pt-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <IoLocationOutline className="shrink-0 text-cyan-400 text-sm" />
          <dd className="truncate">{job?.location || company.location || "Remote / Various"}</dd>
        </div>
        {company.company_size && (
          <div className="flex items-center gap-2">
            <IoPeopleOutline className="shrink-0 text-cyan-400 text-sm" />
            <dd className="truncate">{company.company_size}</dd>
          </div>
        )}
      </dl>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-3">
        <span className="text-[11px] text-slate-500">
          {job?.created_at ? `Posted ${formatDate(job.created_at)}` : "Directory listing"}
        </span>

        {isApplied ? (
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-300">
            <IoCheckmarkCircle className="text-sm" />
            Applied
          </span>
        ) : (
          <button
            type="button"
            onClick={openJob}
            disabled={!hasJob}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-cyan-500/20 transition hover:scale-[1.03] disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
          >
            {hasJob ? "View & Apply" : "No open jobs"}
          </button>
        )}
      </div>
    </article>
  );
};

export default Card;
