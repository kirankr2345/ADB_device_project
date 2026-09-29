import React from "react";

const Center = () => {
  return (
    <main className="relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_35%),linear-gradient(135deg,_#0f172a_0%,_#111827_40%,_#020617_100%)]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:px-10 lg:py-16">
        <div className="max-w-xl">
          <span className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300 sm:text-sm">
            Career growth starts here
          </span>

          <h1 className="mt-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            Your dream job is <span className="text-cyan-400">waiting</span> for you.
          </h1>

          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            Discover top opportunities, connect with leading companies, and move one step closer
            to the career you’ve always wanted.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:-translate-y-0.5 sm:px-6">
              Explore Jobs
            </button>
            <button className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:px-6">
              Join Now
            </button>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <div className="text-2xl font-black text-white">250+</div>
              <div className="text-sm text-slate-300">Companies</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <div className="text-2xl font-black text-white">15k+</div>
              <div className="text-sm text-slate-300">Candidates</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm sm:col-span-1 col-span-2">
              <div className="text-2xl font-black text-white">98%</div>
              <div className="text-sm text-slate-300">Success Rate</div>
            </div>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-cyan-500/30 blur-3xl" />
          <div className="absolute -bottom-10 left-6 h-36 w-36 rounded-full bg-violet-500/25 blur-3xl" />

          <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/70 p-3 shadow-[0_25px_80px_rgba(14,116,144,0.35)] backdrop-blur-md">
            <div
              className="h-72 w-full rounded-[22px] bg-cover bg-center sm:h-80"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80')"
              }}
            />

            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-cyan-400/20 bg-slate-950/60 p-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Hiring now</p>
                <h3 className="mt-1 text-lg font-bold text-white">Top Tech Talent</h3>
              </div>
              <button className="rounded-full bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950">
                View all
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Center;
