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
} from "react-icons/io5";

const readSavedProfile = () => {
  try {
    return JSON.parse(localStorage.getItem("user_profile_draft") || "null");
  } catch {
    return null;
  }
};

const readCurrentUser = () => {
  try {
    return JSON.parse(
      sessionStorage.getItem("user") || localStorage.getItem("user") || "null",
    );
  } catch {
    return null;
  }
};

async function getUserProfile(userId, signal) {
  if (!userId) {
    throw new Error("Your login details are missing. Sign in again to load your profile.");
  }

  const apiBase = (localStorage.getItem("custom_api_url") || "http://127.0.0.1:8000/account")
    .replace(/\/+$/, "");
  const response = await fetch(`${apiBase}/user-profiles/`, {
    credentials: "include",
    signal,
  });

  if (!response.ok) {
    throw new Error(`Profile request failed (${response.status}).`);
  }

  const profiles = await response.json();
  if (!Array.isArray(profiles)) {
    throw new Error("The server returned an invalid profile response.");
  }

  const profile = profiles.find((item) => String(item.user) === String(userId));
  if (!profile) {
    throw new Error("No profile is saved for this account yet.");
  }

  return profile;
}

const ProfileField = ({ icon: Icon, label, ...inputProps }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
    <span className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/15">
      <Icon className="shrink-0 text-lg text-slate-500" aria-hidden="true" />
      <input
        {...inputProps}
        className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-600"
      />
    </span>
  </label>
);

const UserProfile = () => {
  const navigate = useNavigate();
  const currentUser = readCurrentUser();
  const savedProfile = readSavedProfile();
  const [profile, setProfile] = useState(() => ({
    username: currentUser?.username || "",
    role: "candidate",
    phone: "",
    location: "",
    ...savedProfile,
  }));
  const [profileImage, setProfileImage] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    getUserProfile(currentUser?.id, controller.signal)
      .then((data) => {
        setProfile((current) => ({
          ...current,
          id: data.id,
          userId: data.user,
          username: currentUser.username || current.username,
          role: data.role || "candidate",
          phone: data.phone || "",
          location: data.location || "",
          profileImageUrl: data.profile_image || "",
          createdAt: data.created_at || "",
          updatedAt: data.updated_at || "",
        }));
        setLoadError("");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setLoadError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [currentUser?.id, currentUser?.username]);

  useEffect(() => () => {
    if (profileImage) URL.revokeObjectURL(profileImage);
  }, [profileImage]);

  const updateField = (event) => {
    setProfile((current) => ({ ...current, [event.target.name]: event.target.value }));
    setSaved(false);
  };

  const handleImageChange = (event) => {
    const image = event.target.files?.[0];
    if (image) {
      setProfileImage(URL.createObjectURL(image));
      setSaved(false);
    }
  };

  const saveProfile = (event) => {
    event.preventDefault();
    localStorage.setItem("user_profile_draft", JSON.stringify({
      role: profile.role,
      phone: profile.phone,
      location: profile.location,
    }));
    setSaved(true);
  };

  const initials = profile.username.trim().slice(0, 1).toUpperCase() || "U";
  const apiBase = (localStorage.getItem("custom_api_url") || "http://127.0.0.1:8000/account")
    .replace(/\/+$/, "");
  const backendOrigin = apiBase.replace(/\/account\/?$/, "");
  const savedImageUrl = profile.profileImageUrl
    ? new URL(
      profile.profileImageUrl.replace(/^\/+/, ""),
      `${backendOrigin}/media/`,
    ).toString()
    : "";
  const displayedImage = profileImage || savedImageUrl;

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
            Back
          </button>
          <span className="text-sm font-bold tracking-wide text-white">
            Career <span className="text-cyan-400">Hub</span>
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 border-b border-white/10 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Account
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Your profile</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            Keep your contact details and account type up to date.
          </p>
        </div>

        <form onSubmit={saveProfile} className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14">
          <aside className="flex flex-col items-center border-b border-white/10 pb-8 text-center lg:items-start lg:border-b-0 lg:border-r lg:pb-0 lg:pr-10 lg:text-left">
            <div className="relative">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-cyan-400/30 bg-slate-800 text-4xl font-bold text-cyan-300">
                {displayedImage ? (
                  <img src={displayedImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <label
                htmlFor="profile-image"
                title="Choose a profile photo"
                className="absolute bottom-1 right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-slate-950 bg-cyan-500 text-slate-950 transition hover:bg-cyan-300"
              >
                <IoCameraOutline className="text-lg" aria-hidden="true" />
                <span className="sr-only">Choose a profile photo</span>
              </label>
              <input
                id="profile-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only"
              />
            </div>

            <h2 className="mt-5 text-xl font-bold">{profile.username || "Your account"}</h2>
            <p className="mt-1 text-sm capitalize text-slate-400">{profile.role}</p>
            <p className="mt-5 max-w-xs text-sm leading-6 text-slate-500">
              Choose a photo to preview it. Profile image uploads are not supported by the current API.
            </p>
          </aside>

          <section className="min-w-0">
            <div className="mb-6">
              <h2 className="text-lg font-bold">Profile details</h2>
              <p className="mt-1 text-sm text-slate-400">Fields marked here match your account profile.</p>
            </div>

            {(loading || loadError) && (
              <div
                role={loadError ? "alert" : "status"}
                className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
                  loadError
                    ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
                    : "border-slate-700 bg-slate-900 text-slate-300"
                }`}
              >
                {loading ? "Loading your profile…" : loadError}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <ProfileField
                icon={IoPersonOutline}
                label="Username"
                name="username"
                type="text"
                value={profile.username}
                placeholder="Your username"
                readOnly
                aria-readonly="true"
              />
              <ProfileField
                icon={IoCallOutline}
                label="Phone number"
                name="phone"
                type="tel"
                value={profile.phone}
                onChange={updateField}
                placeholder="Add a phone number"
                autoComplete="tel"
              />
              <div className="sm:col-span-2">
                <ProfileField
                  icon={IoLocationOutline}
                  label="Location"
                  name="location"
                  type="text"
                  value={profile.location}
                  onChange={updateField}
                  placeholder="City, region or country"
                  autoComplete="address-level2"
                />
              </div>
            </div>

            <fieldset className="mt-7">
              <legend className="mb-3 text-sm font-medium text-slate-300">I am a</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { value: "candidate", title: "Candidate", description: "I am looking for opportunities." },
                  { value: "recruiter", title: "Recruiter", description: "I am hiring for my organization." },
                ].map((option) => {
                  const selected = profile.role === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setProfile((current) => ({ ...current, role: option.value }));
                        setSaved(false);
                      }}
                      className={`flex min-h-24 items-start gap-3 rounded-xl border p-4 text-left transition ${
                        selected
                          ? "border-cyan-400/70 bg-cyan-400/10"
                          : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                      }`}
                    >
                      <IoBriefcaseOutline className={`mt-0.5 shrink-0 text-lg ${selected ? "text-cyan-300" : "text-slate-500"}`} aria-hidden="true" />
                      <span>
                        <span className="block text-sm font-semibold text-white">{option.title}</span>
                        <span className="mt-1 block text-xs leading-5 text-slate-400">{option.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <dl className="mt-7 grid gap-4 border-t border-white/10 pt-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Profile ID</dt>
                <dd className="mt-1 text-slate-300">{profile.id || "Not available"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Account user ID</dt>
                <dd className="mt-1 text-slate-300">{profile.userId || currentUser?.id || "Not available"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Created</dt>
                <dd className="mt-1 text-slate-300">
                  {profile.createdAt ? new Date(profile.createdAt).toLocaleString() : "Not available"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Last updated</dt>
                <dd className="mt-1 text-slate-300">
                  {profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : "Not available"}
                </dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="min-h-5 text-xs text-slate-500" aria-live="polite">
                {saved ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-300">
                    <IoCheckmarkCircle aria-hidden="true" /> Saved on this device
                  </span>
                ) : (
                  "Details are saved locally until profile sync is connected."
                )}
              </p>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                <IoSaveOutline className="text-base" aria-hidden="true" />
                Save profile
              </button>
            </div>
          </section>
        </form>
      </main>
    </div>
  );
};

export default UserProfile;