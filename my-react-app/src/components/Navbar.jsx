import React from "react";
import { IoBagHandleSharp, IoLogOutOutline } from "react-icons/io5";
import { IoIosSend } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("isAuthenticated");
    localStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/main")}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/25">
            <IoBagHandleSharp className="text-xl" />
          </div>
          <div>
            <h4 className="text-xl font-black tracking-tight text-white sm:text-2xl">
              Career <span className="text-cyan-400">Hub</span>
            </h4>
            <p className="hidden text-xs text-slate-300 sm:block">Find your dream job</p>
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-200 md:flex">
          <a href="#home" className="transition hover:text-cyan-300">Home</a>
          <a href="#jobs" className="transition hover:text-cyan-300">Find Jobs</a>
          <a href="#companies" className="transition hover:text-cyan-300">Companies</a>
          <a href="#candidates" className="transition hover:text-cyan-300">Candidates</a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:scale-[1.02] sm:px-4 sm:py-2.5 sm:text-sm">
            <IoIosSend className="text-base" />
            Post Job
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <IoLogOutOutline className="text-base" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
