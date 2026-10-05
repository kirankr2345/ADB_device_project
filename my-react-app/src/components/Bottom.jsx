import React, { useEffect, useState } from "react";
import Card from "./Card";

const Bottom = () => {
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchListings() {
      try {
        const configuredApi = localStorage.getItem("custom_api_url");
        const apiBase = (configuredApi || "http://127.0.0.1:8000/account").replace(/\/+$/, "");
        const backendOrigin = apiBase.replace(/\/account\/?$/, "");
        const [companyResponse, jobsResponse] = await Promise.all([
          fetch(`${backendOrigin}/job/companies/`, { signal: controller.signal }),
          fetch(`${backendOrigin}/job/jobs/`, { signal: controller.signal }),
        ]);

        if (!companyResponse.ok || !jobsResponse.ok) {
          throw new Error("The jobs service returned an unsuccessful response.");
        }

        const [companyData, jobsData] = await Promise.all([
          companyResponse.json(),
          jobsResponse.json(),
        ]);
        setCompanies(Array.isArray(companyData) ? companyData : []);
        setJobs(Array.isArray(jobsData.results) ? jobsData.results : []);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Error fetching jobs and companies:", err);
        setError("Could not load jobs. Check that the API server is running.");
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
    return () => controller.abort();
  }, []);

  const cards = companies.flatMap((company) => {
    const companyJobs = jobs.filter((job) => String(job.company?.id) === String(company.id));
    return companyJobs.length
      ? companyJobs.map((job) => ({ company, job }))
      : [{ company, job: null }];
  });
  const listedCompanyIds = new Set(companies.map((company) => String(company.id)));
  const jobsWithoutCompanyRecord = jobs
    .filter((job) => !listedCompanyIds.has(String(job.company?.id)))
    .map((job) => ({ company: job.company || {}, job }));

  return (
    <section className="w-full bg-slate-950 px-4 py-12 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-2 text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            Open roles
          </p>
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            {jobs.length} open jobs
          </h2>
          <p className="text-sm text-slate-400">
            {companies.length} companies in the directory. Apply Now opens details for an active job.
          </p>
        </div>

        {loading && <p className="text-slate-300">Loading jobs...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && companies.length === 0 && jobs.length === 0 && (
          <p className="text-slate-300">No companies or open jobs found.</p>
        )}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[...cards, ...jobsWithoutCompanyRecord].map(({ company, job }) => (
            <Card key={job ? `job-${job.id}` : `company-${company.id}`} company={company} job={job} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Bottom;