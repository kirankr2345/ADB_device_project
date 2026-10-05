import React from "react";
import { useNavigate } from "react-router-dom";
import {
  IoCalendarOutline,
  IoGlobeOutline,
  IoLocationOutline,
  IoPeopleOutline,
} from "react-icons/io5";

const getCompanyLogoUrl = (logo) => {
  if (!logo) return "";
  if (/^https?:\/\//i.test(logo)) return logo;
  const apiBase = (localStorage.getItem("custom_api_url") || "http://127.0.0.1:8000/account")
    .replace(/\/+$/, "");
  const backendOrigin = apiBase.replace(/\/account\/?$/, "");
  if (logo.startsWith("/media/")) return new URL(logo, backendOrigin).toString();
  return new URL(logo.replace(/^\/+/, ""), `${backendOrigin}/media/`).toString();
};

const formatDate = (value) => {
  if (!value) return "Date not listed";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const Card = ({ company = {}, job = null }) => {
  const navigate = useNavigate();
  const hasJob = Boolean(job?.id);
  const companyName = company.name || "Company";
  const logoUrl = getCompanyLogoUrl(company.logo);

  const openJob = () => {
    if (!hasJob) return;
    navigate(`/jobs/${job.id}`, {
      state: { job: { ...job, company } },
    });
  };

  return (
    <article className="flex h-full min-w-0 flex-col rounded-xl border border-slate-800 bg-slate-900/80 p-5 transition hover:border-cyan-500/40">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-700 bg-slate-800 text-lg font-bold text-cyan-300">
          {logoUrl ? (
            <img src={logoUrl} alt={`${companyName} logo`} className="h-full w-full object-contain" />
          ) : (
            companyName.trim().slice(0, 1).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-white">{companyName}</h3>
          <p className="mt-1 truncate text-xs text-cyan-300">{company.industry || "Industry not listed"}</p>
        </div>
      </div>

      <div className="mt-5">
        <h4 className="text-lg font-bold leading-snug text-white">
          {job?.title || "Company profile"}
        </h4>
        {company.description && (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
            {company.description}
          </p>
        )}
        <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-300">
          {job?.description || "No open roles are listed for this company yet."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
          {job?.job_type && <span className="rounded-md bg-slate-800 px-2.5 py-1.5">{job.job_type.replaceAll("_", " ")}</span>}
          {job?.work_mode && <span className="rounded-md bg-slate-800 px-2.5 py-1.5">{job.work_mode}</span>}
          {job?.experience && <span className="rounded-md bg-slate-800 px-2.5 py-1.5">{job.experience} years</span>}
          {job?.category && <span className="rounded-md bg-slate-800 px-2.5 py-1.5">{job.category}</span>}
        </div>
      </div>

      <dl className="my-5 grid gap-3 border-y border-slate-800 py-4 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <IoLocationOutline className="shrink-0 text-cyan-300" aria-hidden="true" />
          <dt className="sr-only">Location</dt>
          <dd className="truncate">{company.location || job.location || "Location not listed"}</dd>
        </div>
        <div className="flex items-center gap-2">
          <IoPeopleOutline className="shrink-0 text-cyan-300" aria-hidden="true" />
          <dt className="sr-only">Company size</dt>
          <dd className="truncate">{company.company_size || "Company size not listed"}</dd>
        </div>
        <div className="flex items-center gap-2">
          <IoCalendarOutline className="shrink-0 text-cyan-300" aria-hidden="true" />
          <dt className="sr-only">Founded</dt>
          <dd>{company.founded_year ? `Founded ${company.founded_year}` : "Founded year not listed"}</dd>
        </div>
        {company.website && (
          <div className="flex min-w-0 items-center gap-2">
            <IoGlobeOutline className="shrink-0 text-cyan-300" aria-hidden="true" />
            <dt className="sr-only">Website</dt>
            <dd className="truncate">
              <a href={company.website} target="_blank" rel="noreferrer" className="hover:text-cyan-300">
                {company.website.replace(/^https?:\/\//, "")}
              </a>
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-auto flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500">Added {formatDate(company.created_at)}</span>
        <button
          type="button"
          onClick={openJob}
          disabled={!hasJob}
          className="min-h-10 shrink-0 rounded-lg bg-cyan-500 px-3.5 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
        >
          {hasJob ? "Apply Now" : "No open jobs"}
        </button>
      </div>
    </article>
  );
};

export default Card;
