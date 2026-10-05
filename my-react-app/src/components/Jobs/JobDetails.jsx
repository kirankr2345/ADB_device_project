import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  IoArrowBack,
  IoBriefcaseOutline,
  IoCalendarOutline,
  IoCheckmarkCircleOutline,
  IoLocationOutline,
  IoPeopleOutline,
  IoTimeOutline,
} from "react-icons/io5";

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
  if (minimum == null && maximum == null) return "Salary not specified";
  const formatAmount = (amount) => Number(amount).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
  if (minimum == null) return `Up to ${formatAmount(maximum)}`;
  if (maximum == null) return `From ${formatAmount(minimum)}`;
  return `${formatAmount(minimum)} – ${formatAmount(maximum)}`;
};

const getRelatedName = (value) => {
  if (!value) return "Not specified";
  if (typeof value === "object") return value.name || value.title || value.id || "Not specified";
  return value;
};

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex min-w-0 items-start gap-3">
    <Icon className="mt-0.5 shrink-0 text-lg text-cyan-300" aria-hidden="true" />
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-slate-200">{value || "Not specified"}</dd>
    </div>
  </div>
);

const JobDetails = ({ job: jobProp }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { jobId } = useParams();
  const job = jobProp || location.state?.job;

  if (!job) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <section className="w-full max-w-lg border-y border-white/10 py-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">Job {jobId || "details"}</p>
          <h1 className="mt-3 text-2xl font-bold">No job selected</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Open a job with its details to view the full posting.
          </p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
          >
            <IoArrowBack aria-hidden="true" />
            Back to jobs
          </button>
        </section>
      </main>
    );
  }

  const companyName = getRelatedName(job.company);
  const categoryName = getRelatedName(job.category);
  const skillNames = Array.isArray(job.skills)
    ? job.skills.map((skill) => getRelatedName(skill)).filter(Boolean)
    : [];
  const recruiterName = job.recruiter?.user?.username
    || job.recruiter?.username
    || getRelatedName(job.recruiter);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg py-2 pr-3 text-sm font-medium text-slate-300 transition hover:text-white"
          >
            <IoArrowBack aria-hidden="true" />
            Back to jobs
          </button>
          <span className="text-sm font-bold tracking-wide">
            Career <span className="text-cyan-400">Hub</span>
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <article>
          <header className="border-b border-white/10 pb-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-cyan-300">{companyName}</p>
                <h1 className="mt-2 max-w-3xl break-words text-3xl font-black leading-tight sm:text-4xl">
                  {job.title || "Untitled position"}
                </h1>
                {job.category && (
                  <p className="mt-3 text-sm text-slate-400">{categoryName}</p>
                )}
              </div>
              <span className={`inline-flex shrink-0 items-center gap-2 self-start rounded-full border px-3 py-1.5 text-xs font-semibold ${
                job.is_active === false
                  ? "border-slate-700 bg-slate-800 text-slate-400"
                  : "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
              }`}>
                <IoCheckmarkCircleOutline aria-hidden="true" />
                {job.is_active === false ? "Closed" : "Accepting applications"}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {[job.job_type, job.work_mode, job.experience && `${job.experience} years experience`]
                .filter(Boolean)
                .map((item) => (
                  <span key={item} className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300">
                    {item === job.experience ? item : formatLabel(item)}
                  </span>
                ))}
            </div>
          </header>

          <div className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
            <section className="min-w-0">
              <h2 className="text-lg font-bold">About this role</h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-300">
                {job.description || "No job description provided."}
              </p>

              <div className="mt-9">
                <h2 className="text-lg font-bold">Required skills</h2>
                {skillNames.length ? (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {skillNames.map((skill) => (
                      <li key={skill} className="rounded-md bg-cyan-400/10 px-3 py-2 text-sm font-medium text-cyan-200">
                        {skill}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">No skills listed.</p>
                )}
              </div>
            </section>

            <aside className="h-fit border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <h2 className="text-lg font-bold">Job overview</h2>
              <dl className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
                <DetailItem icon={IoBriefcaseOutline} label="Job type" value={formatLabel(job.job_type)} />
                <DetailItem icon={IoLocationOutline} label="Work mode" value={formatLabel(job.work_mode)} />
                <DetailItem icon={IoLocationOutline} label="Location" value={job.location || job.company_location} />
                <DetailItem icon={IoTimeOutline} label="Experience" value={job.experience ? `${job.experience} years` : "Not specified"} />
                <DetailItem icon={IoPeopleOutline} label="Open positions" value={job.vacancies ?? "Not specified"} />
                <DetailItem icon={IoCalendarOutline} label="Application deadline" value={formatDate(job.application_deadline)} />
                <DetailItem icon={IoBriefcaseOutline} label="Salary range" value={formatSalary(job.salary_min, job.salary_max)} />
                <DetailItem icon={IoBriefcaseOutline} label="Recruiter" value={recruiterName} />
                <DetailItem icon={IoCalendarOutline} label="Posted" value={formatDate(job.created_at)} />
                <DetailItem icon={IoCalendarOutline} label="Last updated" value={formatDate(job.updated_at)} />
              </dl>
            </aside>
          </div>
        </article>
      </main>
    </div>
  );
};

export default JobDetails;