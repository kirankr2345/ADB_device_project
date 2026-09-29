import React, { useState, useEffect } from "react";
import axios from "axios";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Main from "./components/main";
import { IoBagHandleSharp, IoSettingsOutline, IoCheckmarkCircle, IoWarningOutline, IoRefresh } from "react-icons/io5";

// Smart API URL Detection with fallback options for ADB / Mobile / Web.
// On a native (Capacitor) build the app is served from http://localhost, so we
// cannot reach the dev machine that way. Default to 127.0.0.1:8000, which maps
// back to the PC for BOTH emulators and physical devices once you run:
//     adb reverse tcp:8000 tcp:8000
// (10.0.2.2 only works on the Android emulator, so it is not the default.)
const getDefaultApiUrl = () => {
  const saved = localStorage.getItem("custom_api_url");
  if (saved) return saved;

  const hostname = window.location.hostname;
  const isCapacitorNative = Boolean(window.Capacitor?.isNativePlatform?.() || window.Capacitor?.isNative);

  // Native app, or served from the Capacitor localhost origin: use adb reverse.
  if (isCapacitorNative || hostname === "localhost" || hostname === "127.0.0.1" || hostname === "") {
    return "http://127.0.0.1:8000/account";
  }

  // Served over a LAN IP (e.g. vite preview on your network): talk to the same host.
  return `http://${hostname}:8000/account`;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" }); // type: 'success' | 'error' | 'info'
  const [loading, setLoading] = useState(false);

  // API configuration state
  const [apiUrl, setApiUrl] = useState(getDefaultApiUrl());
  const [customIp, setCustomIp] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [pingStatus, setPingStatus] = useState({ state: "idle", msg: "" }); // 'idle' | 'testing' | 'success' | 'error'

  useEffect(() => {
    // If user is already authenticated, redirect to /main
    if (sessionStorage.getItem("isAuthenticated") === "true" || localStorage.getItem("isAuthenticated") === "true") {
      navigate("/main");
    }
  }, [navigate]);

  const saveApiUrl = (newUrl) => {
    const formatted = newUrl.replace(/\/+$/, '');
    setApiUrl(formatted);
    localStorage.setItem("custom_api_url", formatted);
    testConnection(formatted);
  };

  const testConnection = async (targetUrl = apiUrl) => {
    setPingStatus({ state: "testing", msg: "Connecting to server..." });
    try {
      const pingEndpoint = targetUrl.endsWith('/account') ? `${targetUrl}/ping/` : `${targetUrl}/account/ping/`;
      const res = await axios.get(pingEndpoint, { timeout: 4000 });
      if (res.data?.status === "ok") {
        setPingStatus({ state: "success", msg: "Server connected successfully!" });
      } else {
        setPingStatus({ state: "success", msg: "Server responded" });
      }
    } catch (err) {
      setPingStatus({ 
        state: "error", 
        msg: err.code === "ECONNABORTED" ? "Timeout: Server unreachable" : (err.message || "Failed to connect to backend") 
      });
    }
  };

  const registerUser = async () => {
    if (!username.trim() || !password.trim()) {
      setMessage({ text: "Please enter both username and password.", type: "error" });
      return;
    }
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const response = await axios.post(`${apiUrl}/register/`, { username, password });
      if (response.data.error) {
        setMessage({ text: response.data.error, type: "error" });
      } else {
        setMessage({ text: response.data.message || "User registered successfully! You can now log in.", type: "success" });
        setMode("login");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || error.message || "Registration failed. Please check network.";
      setMessage({ text: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async () => {
    if (!username.trim() || !password.trim()) {
      setMessage({ text: "Please enter both username and password.", type: "error" });
      return;
    }
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const response = await axios.post(
        `${apiUrl}/login/`,
        { username, password },
        { withCredentials: true }
      );

      if (response.data.error) {
        setMessage({ text: response.data.error, type: "error" });
      } else {
        sessionStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("isAuthenticated", "true");
        if (response.data.user) {
          sessionStorage.setItem("user", JSON.stringify(response.data.user));
        }
        setMessage({ text: response.data.message || "Login successful!", type: "success" });
        setTimeout(() => navigate("/main"), 300);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || "Login failed. Ensure backend is running and username/password are correct.";
      setMessage({ text: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "register") {
      await registerUser();
    } else {
      await loginUser();
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black px-4 py-8 sm:px-6 lg:px-8 safe-pt safe-pb">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/60 shadow-[0_25px_80px_rgba(14,116,144,0.35)] backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
        
        {/* Left Hero Panel */}
        <div className="hidden flex-col justify-between bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-blue-950/40 p-10 lg:flex border-r border-white/10">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
                <IoBagHandleSharp className="text-2xl" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Career <span className="text-cyan-400">Hub</span>
              </span>
            </div>

            <div className="mt-12 max-w-md rounded-[28px] border border-white/10 bg-slate-950/50 p-8 shadow-2xl backdrop-blur-md">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">
                Welcome Back
              </p>
              <h1 className="text-3xl font-black leading-tight text-white">
                Grow your future with top career opportunities.
              </h1>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                Discover jobs, connect with top companies, and build a career you are proud of.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3 text-sm text-slate-200">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white">250+</div>
                  <div className="text-xs text-slate-400">Companies</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white">15k+</div>
                  <div className="text-xs text-slate-400">Candidates</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            © 2026 Career Hub. Mobile & Desktop Portal.
          </div>
        </div>

        {/* Right Form Section */}
        <div className="flex flex-col justify-center bg-slate-900/90 p-6 sm:p-8 lg:p-10">
          
          {/* Header & Mobile Logo */}
          <div className="mb-6 text-center lg:text-left">
            <div className="mb-3 flex items-center justify-center gap-2 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-md">
                <IoBagHandleSharp className="text-lg" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Career <span className="text-cyan-400">Hub</span>
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </p>
            <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
              {mode === "login" ? "Sign in to your account" : "Join Career Hub today"}
            </h2>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="mb-6 flex rounded-xl border border-white/10 bg-slate-950/60 p-1">
            <button
              type="button"
              onClick={() => { setMode("login"); setMessage({ text: "", type: "" }); }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                mode === "login"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setMessage({ text: "", type: "" }); }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                mode === "register"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-700/60 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-700/60 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            {/* Notification Banner */}
            {message.text && (
              <div
                className={`flex items-start gap-2.5 rounded-xl p-3.5 text-xs font-medium ${
                  message.type === "success"
                    ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border border-rose-500/30 bg-rose-500/10 text-rose-300"
                }`}
              >
                {message.type === "success" ? (
                  <IoCheckmarkCircle className="mt-0.5 text-base shrink-0 text-emerald-400" />
                ) : (
                  <IoWarningOutline className="mt-0.5 text-base shrink-0 text-rose-400" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            {/* Main Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <IoRefresh className="animate-spin text-lg" />
                  <span>Processing...</span>
                </>
              ) : mode === "login" ? (
                "Log In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Quick toggle mode text */}
          <p className="mt-4 text-center text-xs text-slate-400">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setMessage({ text: "", type: "" });
              }}
              className="font-bold text-cyan-400 hover:underline"
            >
              {mode === "login" ? "Register here" : "Sign in here"}
            </button>
          </p>

          {/* Backend Connection Settings Accordion */}
          <div className="mt-6 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="flex w-full items-center justify-between text-xs font-semibold text-slate-400 transition hover:text-cyan-300"
            >
              <span className="flex items-center gap-1.5">
                <IoSettingsOutline className="text-sm text-cyan-400" />
                Backend Server Settings (ADB / Device)
              </span>
              <span>{showSettings ? "▲ Hide" : "▼ Configure"}</span>
            </button>

            {showSettings && (
              <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-xs">
                <p className="mb-2 font-medium text-slate-300">Active API Base URL:</p>
                <code className="block rounded-lg bg-black/60 px-3 py-2 text-cyan-300 break-all font-mono">
                  {apiUrl}
                </code>

                <p className="mt-3 mb-1.5 font-medium text-slate-300">Preset Endpoints:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => saveApiUrl("http://10.0.2.2:8000/account")}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-slate-200 hover:border-cyan-500 hover:text-white"
                  >
                    10.0.2.2:8000 (Emulator)
                  </button>
                  <button
                    type="button"
                    onClick={() => saveApiUrl("http://127.0.0.1:8000/account")}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-slate-200 hover:border-cyan-500 hover:text-white"
                  >
                    127.0.0.1:8000 (PC / ADB Reverse)
                  </button>
                </div>

                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="http://192.168.x.x:8000/account"
                    value={customIp}
                    onChange={(e) => setCustomIp(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-white placeholder-slate-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customIp.trim()) saveApiUrl(customIp.trim());
                    }}
                    className="rounded-lg bg-cyan-600 px-3 py-1.5 font-semibold text-white hover:bg-cyan-500"
                  >
                    Save IP
                  </button>
                </div>

                {/* Connection Test */}
                <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3">
                  <button
                    type="button"
                    onClick={() => testConnection()}
                    className="flex items-center gap-1 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 font-semibold text-cyan-300 hover:bg-cyan-500/20"
                  >
                    <IoRefresh className={pingStatus.state === "testing" ? "animate-spin" : ""} />
                    Test Connection
                  </button>

                  {pingStatus.msg && (
                    <span
                      className={`text-[11px] font-medium ${
                        pingStatus.state === "success"
                          ? "text-emerald-400"
                          : pingStatus.state === "error"
                          ? "text-rose-400"
                          : "text-slate-400"
                      }`}
                    >
                      {pingStatus.msg}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const isAuthenticated =
    sessionStorage.getItem("isAuthenticated") === "true" ||
    localStorage.getItem("isAuthenticated") === "true";

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/main"
        element={
          <ProtectedRoute>
            <Main />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
