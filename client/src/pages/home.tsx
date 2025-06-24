import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import EventsPage from "@/pages/events";
import DiscoverPage from "@/pages/discover";
import MemoriesPage from "@/pages/memories";
import ProfilePage from "@/pages/profile";
import ChatOverlay from "@/components/chat-overlay";

export default function Home() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("events");
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen camp-gradient-main flex items-center justify-center">
        <div className="text-white text-center">
          <div className="loading-pulse text-4xl font-bold mb-4">Tripp'In</div>
          <p className="text-blue-200">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "events":
        return <EventsPage onOpenChat={(eventId) => {
          setSelectedEventId(eventId);
          setChatOpen(true);
        }} />;
      case "discover":
        return <DiscoverPage />;
      case "memories":
        return <MemoriesPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return <EventsPage onOpenChat={(eventId) => {
          setSelectedEventId(eventId);
          setChatOpen(true);
        }} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-stone-900">
      <div className="pb-20">
        {renderContent()}
      </div>
      
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Floating Chat Button */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-24 right-6 z-40 bg-gradient-to-r from-emerald-600 to-teal-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-xl border border-emerald-400/30"
      >
        <span className="text-2xl">💬</span>
      </button>

      <ChatOverlay 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)}
        eventId={selectedEventId}
      />
    </div>
  );
}
