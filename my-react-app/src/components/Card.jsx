import React from "react";

const Card = () => {
  return (
    <article className="flex h-full flex-col justify-between rounded-[26px] border border-slate-800 bg-slate-900/80 p-4 shadow-[0_20px_40px_rgba(15,23,42,0.45)] transition duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-[0_24px_50px_rgba(34,211,238,0.18)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-slate-700 bg-white p-2">
          <img
            src="https://thumbs.dreamstime.com/b/amazon-logo-editorial-illustrative-white-background-eps-download-vector-jpeg-banner-ai-amazon-logo-editorial-illustrative-208329107.jpg?w=768"
            alt="Company logo"
            className="h-full w-full rounded-xl object-cover"
          />
        </div>
        <span className="text-[10px] font-medium text-slate-400">5 days ago</span>
      </div>

      <div className="mt-5">
        <div className="flex items-center gap-2 text-sm text-slate-200">
          <h3 className="font-semibold">Amazon</h3>
        </div>

        <h4 className="mt-3 text-xl font-bold text-white">Senior UI/UX Designer</h4>

        <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-medium text-slate-200">
          <span className="rounded-full bg-slate-700 px-3 py-1.5">Part Time</span>
          <span className="rounded-full bg-slate-700 px-3 py-1.5">Senior Level</span>
        </div>
      </div>

      <hr className="my-4 border-slate-700" />

      <div className="flex items-end justify-between gap-3">
        <div>
          <h5 className="text-lg font-black text-cyan-400">$120/hr</h5>
          <p className="mt-1 text-[11px] text-slate-400">Bengaluru, India</p>
        </div>

        <button className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300">
          Apply Now
        </button>
      </div>
    </article>
  );
};

export default Card;
