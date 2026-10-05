import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoArrowBack,
  IoBriefcaseOutline,
  IoCallOutline,
  IoCameraOutline,
  IoCheckmarkCircle,
  IoLocationOutline,
  IoPersonOutline,
  IoSaveOutline,
  IoDocumentAttachOutline,
  IoCloudUploadOutline,
  IoTrashOutline,
  IoGlobeOutline,
  IoLogoLinkedin,
  IoLogoGithub,
  IoRefresh
} from "react-icons/io5";
import { api, getCurrentUser, getMediaUrl } from "../../api";

const UserProfile = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [profile, setProfile] = useState({
    username: currentUser?.username || "",
    role: currentUser?.role || "candidate",
    phone: "",
    location: "",
    headline: "",
    bio: "",
    current_job_title: "",
    experience_years: "0",
    expected_salary: "",
    preferred_location: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
  });

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [uploadingResume, setUploadingResume] = useState(false);

  const fetchProfileAndResumes = async () => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }
    try {
      const [profRes, resRes] = await Promise.all([
        api.getProfile(currentUser.id),
        api.getResumes(currentUser.id),
      ]);

      const uProf = profRes.data?.user_profile || {};
      const cProf = profRes.data?.candidate_profile || {};

      setProfile((prev) => ({
        ...prev,
        role: uProf.role || prev.role,
        phone: uProf.phone || "",
        location: uProf.location || "",
        headline: cProf.headline || "",
        bio: cProf.bio || "",
        current_job_title: cProf.current_job_title || "",
        experience_years: cProf.experience_years != null ? String(cProf.experience_years) : "0",
        expected_salary: cProf.expected_salary != null ? String(cProf.expected_salary) : "",
        preferred_location: cProf.preferred_location || "",
        linkedin_url: cProf.linkedin_url || "",
        github_url: cProf.github_url || "",
        portfolio_url: cProf.portfolio_url || "",
      }));

      setResumes(Array.isArray(resRes.data) ? resRes.data : []);
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndResumes();
  }, [currentUser?.id]);

  const updateField = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setMessage({ text: "", type: "" });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!currentUser?.id) return;
    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      await api.updateProfile({
        user_id: currentUser.id,
        ...profile,
      });

      // Update local storage user object with new role/phone
      const updatedUser = { ...currentUser, role: profile.role, phone: profile.phone, location: profile.location };
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setMessage({ text: "Profile updated and saved to backend successfully!", type: "success" });
    } catch (err) {
      console.error("Save profile error:", err);
      setMessage({ text: "Failed to save profile. Try again.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser?.id) return;
    setUploadingResume(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name);
    formData.append("user_id", currentUser.id);

    try {
      const res = await api.uploadResume(formData);
      setResumes((prev) => [...prev, res.data]);
      setMessage({ text: "Resume uploaded successfully!", type: "success" });
    } catch (err) {
      console.error("Resume upload error:", err);
      setMessage({ text: "Failed to upload resume file.", type: "error" });
    } finally {
      setUploadingResume(false);
    }
  };

  const handleDeleteResume = async (resumeId) => {
    try {
      await api.deleteResume(resumeId);
      setResumes((prev) => prev.filter((r) => r.id !== resumeId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <IoRefresh className="animate-spin text-3xl text-cyan-400 mx-auto" />
          <p className="mt-2 text-sm text-slate-400">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top Navbar */}
      <header className="border-b border-white/10 bg-slate-950/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white"
          >
            <IoArrowBack />
            Back
          </button>
          <span className="text-sm font-bold tracking-wide">
            Career <span className="text-cyan-400">Hub</span>
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 border-b border-white/10 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Account Management
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">User Profile & Career Resume</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            Keep your contact information, candidate profile, skills, and uploaded resumes updated.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14">
          
          {/* Left Avatar & Role Card */}
          <aside className="flex flex-col items-center border-b border-white/10 pb-8 text-center lg:items-start lg:border-b-0 lg:border-r lg:pb-0 lg:pr-10 lg:text-left">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-cyan-400/30 bg-slate-800 text-4xl font-bold text-cyan-300 shadow-xl">
              {profile.username.trim().slice(0, 1).toUpperCase() || "U"}
            </div>

            <h2 className="mt-5 text-xl font-bold">{profile.username}</h2>
            <span className="mt-1 rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-bold uppercase text-cyan-300 border border-cyan-500/30">
              {profile.role}
            </span>

            {/* Role Switcher */}
            <div className="mt-6 w-full space-y-2">
              <label className="text-xs font-semibold text-slate-400 block">Account Role</label>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-900 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setProfile({ ...profile, role: "candidate" })}
                  className={`rounded-lg py-2 text-xs font-bold transition ${
                    profile.role === "candidate" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Candidate
                </button>
                <button
                  type="button"
                  onClick={() => setProfile({ ...profile, role: "recruiter" })}
                  className={`rounded-lg py-2 text-xs font-bold transition ${
                    profile.role === "recruiter" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Recruiter
                </button>
              </div>
            </div>

            {/* Resume Upload Box */}
            <div className="mt-8 w-full border-t border-slate-800 pt-6">
              <h3 className="text-sm font-bold text-white mb-3">Resumes & CVs</h3>
              
              <div className="space-y-2 mb-4">
                {resumes.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-xl bg-slate-900 p-3 text-xs border border-slate-800">
                    <div className="flex items-center gap-2 truncate">
                      <IoDocumentAttachOutline className="text-cyan-400 text-lg shrink-0" />
                      <span className="truncate font-medium">{r.title || `Resume #${r.id}`}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteResume(r.id)}
                      className="text-rose-400 hover:text-rose-300 ml-2"
                    >
                      <IoTrashOutline className="text-base" />
                    </button>
                  </div>
                ))}
              </div>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/20">
                <IoCloudUploadOutline className="text-lg" />
                <span>{uploadingResume ? "Uploading..." : "Upload Resume (PDF)"}</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  disabled={uploadingResume}
                  className="sr-only"
                />
              </label>
            </div>
          </aside>

          {/* Right Form Fields */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-3">Personal & Professional Details</h2>

            {message.text && (
              <div
                className={`rounded-xl p-4 text-xs font-medium ${
                  message.type === "success"
                    ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border border-rose-500/30 bg-rose-500/10 text-rose-300"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">Username</label>
                <input
                  type="text"
                  value={profile.username}
                  readOnly
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/50 p-3.5 text-sm text-slate-400 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  value={profile.phone}
                  onChange={updateField}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3.5 text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-semibold text-slate-300">Headline / Current Title</label>
                <input
                  type="text"
                  name="headline"
                  placeholder="e.g. Senior Full Stack Developer @ TechCorp"
                  value={profile.headline}
                  onChange={updateField}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3.5 text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-semibold text-slate-300">Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="City, State, Country"
                  value={profile.location}
                  onChange={updateField}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3.5 text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-semibold text-slate-300">Professional Bio</label>
                <textarea
                  rows={4}
                  name="bio"
                  placeholder="Write a brief overview of your background, achievements, and career goals..."
                  value={profile.bio}
                  onChange={updateField}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3.5 text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">Years of Experience</label>
                <input
                  type="number"
                  name="experience_years"
                  step="0.5"
                  value={profile.experience_years}
                  onChange={updateField}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3.5 text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">Expected Salary ($ / yr)</label>
                <input
                  type="number"
                  name="expected_salary"
                  placeholder="120000"
                  value={profile.expected_salary}
                  onChange={updateField}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3.5 text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="border-t border-slate-800 pt-6 space-y-4">
              <h3 className="text-sm font-bold text-white">Social & Portfolio Links</h3>
              
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5">
                  <IoLogoLinkedin className="text-cyan-400 text-lg shrink-0" />
                  <input
                    type="url"
                    name="linkedin_url"
                    placeholder="LinkedIn URL"
                    value={profile.linkedin_url}
                    onChange={updateField}
                    className="w-full bg-transparent text-xs text-white outline-none placeholder-slate-500"
                  />
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5">
                  <IoLogoGithub className="text-cyan-400 text-lg shrink-0" />
                  <input
                    type="url"
                    name="github_url"
                    placeholder="GitHub URL"
                    value={profile.github_url}
                    onChange={updateField}
                    className="w-full bg-transparent text-xs text-white outline-none placeholder-slate-500"
                  />
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5">
                  <IoGlobeOutline className="text-cyan-400 text-lg shrink-0" />
                  <input
                    type="url"
                    name="portfolio_url"
                    placeholder="Portfolio URL"
                    value={profile.portfolio_url}
                    onChange={updateField}
                    className="w-full bg-transparent text-xs text-white outline-none placeholder-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 hover:scale-[1.02] disabled:opacity-50"
              >
                <IoSaveOutline />
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>

          </section>
        </form>
      </main>
    </div>
  );
};

export default UserProfile;