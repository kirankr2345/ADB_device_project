import React, { useState, useEffect, useRef } from "react";
import { 
  IoBagHandleSharp, 
  IoLogOutOutline, 
  IoNotificationsOutline, 
  IoCheckmarkDoneOutline,
  IoBriefcaseOutline,
  IoAddCircleOutline,
  IoBookmarkOutline
} from "react-icons/io5";
import { FaUserTie } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { api, getCurrentUser } from "../api";

const Navbar = ({ activeTab = "jobs", setActiveTab = () => {}, onOpenPostJob = () => {} }) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const role = currentUser?.role || "candidate";

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!currentUser?.id) return;
    try {
      const res = await api.getNotifications(currentUser.id);
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    if (!currentUser?.id) return;
    try {
      await api.markNotificationsRead(currentUser.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isAuthenticated");
    localStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("user");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => { setActiveTab("jobs"); navigate("/main"); }}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/25">
            <IoBagHandleSharp className="text-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                Career <span className="text-cyan-400">Hub</span>
              </h4>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                role === "recruiter" 
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" 
                  : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              }`}>
                {role}
              </span>
            </div>
            <p className="hidden text-xs text-slate-400 sm:block">Find jobs & build your career</p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden items-center gap-2 text-sm font-medium text-slate-300 md:flex">
          <button
            onClick={() => { setActiveTab("jobs"); navigate("/main"); }}
            className={`rounded-xl px-4 py-2 transition ${
              activeTab === "jobs"
                ? "bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30"
                : "hover:bg-white/5 hover:text-white"
            }`}
          >
            Find Jobs
          </button>

          {role === "candidate" && (
            <>
              <button
                onClick={() => { setActiveTab("saved"); navigate("/main"); }}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 transition ${
                  activeTab === "saved"
                    ? "bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30"
                    : "hover:bg-white/5 hover:text-white"
                }`}
              >
                <IoBookmarkOutline className="text-base" />
                Saved Jobs
              </button>

              <button
                onClick={() => { setActiveTab("applications"); navigate("/main"); }}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 transition ${
                  activeTab === "applications"
                    ? "bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30"
                    : "hover:bg-white/5 hover:text-white"
                }`}
              >
                <IoBriefcaseOutline className="text-base" />
                My Applications
              </button>
            </>
          )}

          {role === "recruiter" && (
            <button
              onClick={() => { setActiveTab("recruiter"); navigate("/main"); }}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 transition ${
                activeTab === "recruiter"
                  ? "bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30"
                  : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <IoBriefcaseOutline className="text-base" />
              Recruiter Dashboard
            </button>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Recruiter "Post Job" CTA */}
          {role === "recruiter" && (
            <button
              onClick={onOpenPostJob}
              className="hidden sm:flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-purple-500/25 transition hover:scale-[1.02]"
            >
              <IoAddCircleOutline className="text-lg" />
              Post a Job
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-slate-700 hover:text-white"
              title="Notifications"
            >
              <IoNotificationsOutline className="text-xl" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-black text-slate-950 shadow-md animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl z-50">
                <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1 text-xs text-cyan-400 hover:underline"
                    >
                      <IoCheckmarkDoneOutline /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-500">No notifications yet.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`rounded-xl p-3 text-xs transition ${
                          n.is_read ? "bg-slate-950/40 text-slate-400" : "border border-cyan-500/30 bg-cyan-500/10 text-slate-200"
                        }`}
                      >
                        <p className="font-bold text-white">{n.title}</p>
                        <p className="mt-1 leading-5">{n.message}</p>
                        <p className="mt-1.5 text-[10px] text-slate-500">
                          {new Date(n.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:scale-[1.02] sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <FaUserTie />
            Profile
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20 sm:px-4 sm:py-2.5 sm:text-sm"
            title="Log Out"
          >
            <IoLogOutOutline className="text-base" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
