import React from "react";
import Card from "./Card";

const Bottom = () => {
  return (
    <section className="w-full bg-slate-950 px-4 py-12 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-2 text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            Featured Jobs
          </p>
          <h2 className="text-3xl font-black text-white sm:text-4xl">Fresh opportunities for you</h2>
          <p className="text-sm text-slate-400">
            Explore curated jobs from top companies and discover your next big move.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <Card />
          <Card />
          <Card />
          <Card />
        </div>
      </div>
    </section>
  );
};

export default Bottom;