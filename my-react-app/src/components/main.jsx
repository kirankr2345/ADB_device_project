import React from "react";
import Navbar from "./Navbar";
import Center from "./Center";
import Bottom from "./Bottom";

const Main = () => {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-white">
      <Navbar />
      <Center />
      <Bottom/>
    </div>
  );
};

export default Main;