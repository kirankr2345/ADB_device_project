import React, { useState } from "react";
import Navbar from "./Navbar";
import Center from "./Center";
import Bottom from "./Bottom";
import PostJobModal from "./Jobs/PostJobModal";

const Main = () => {
  const [activeTab, setActiveTab] = useState("jobs");
  const [searchFilters, setSearchFilters] = useState({});
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSearchFromHero = (filters) => {
    setActiveTab("jobs");
    setSearchFilters(filters);
  };

  const handleJobPosted = () => {
    setActiveTab("jobs");
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenPostJob={() => setShowPostJobModal(true)} 
      />
      
      {activeTab === "jobs" && (
        <Center onSearch={handleSearchFromHero} />
      )}

      <Bottom 
        key={refreshKey}
        activeTab={activeTab} 
        searchFilters={searchFilters} 
        onOpenPostJob={() => setShowPostJobModal(true)}
      />

      <PostJobModal 
        isOpen={showPostJobModal} 
        onClose={() => setShowPostJobModal(false)}
        onJobPosted={handleJobPosted}
      />
    </div>
  );
};

export default Main;