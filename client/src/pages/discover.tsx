import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState } from "react";
import type { Event } from "@shared/schema";

const TRENDING_TAGS = [
  { name: "#RooftopVibes", color: "bg-green-500" },
  { name: "#HikingBuddies", color: "bg-blue-500" },
  { name: "#FoodieFriends", color: "bg-orange-500" },
  { name: "#TechMixer", color: "bg-purple-500" },
  { name: "#BeachDay", color: "bg-red-500" },
];

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const filteredEvents = events.filter(event => {
    if (!searchQuery) return true;
    return (
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const getEventTypeEmoji = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case 'party': return '🎉';
      case 'hiking': return '🥾';
      case 'food': return '🍕';
      case 'gaming': return '🎮';
      case 'networking': return '💼';
      case 'beach': return '🏖️';
      case 'shopping': return '🛍️';
      default: return '📅';
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case 'party': return 'bg-purple-500';
      case 'hiking': return 'bg-green-500';
      case 'food': return 'bg-red-500';
      case 'gaming': return 'bg-blue-500';
      case 'networking': return 'bg-orange-500';
      case 'beach': return 'bg-cyan-500';
      case 'shopping': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="camp-gradient-orange p-4 text-white rounded-b-2xl">
          <h2 className="text-xl font-bold mb-3">Discover Events</h2>
          <div className="animate-pulse">
            <div className="h-10 bg-white/20 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-stone-800 p-6 relative overflow-hidden border-b border-slate-700">
        <div className="absolute top-4 right-8 text-3xl opacity-20">🔍</div>
        <div className="absolute bottom-4 left-8 text-2xl opacity-15">🗺️</div>
        
        <div className="relative z-10">
          <h2 className="text-3xl adventure-title mb-2 text-emerald-400">DISCOVER ADVENTURES</h2>
          <p className="text-slate-300 adventure-font text-sm mb-6">Find your next epic experience</p>
          
          <div className="relative">
            <Input
              type="text"
              placeholder="Search adventures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-4 pl-12 rounded-xl bg-slate-700/50 text-white border border-slate-600 placeholder-slate-400 adventure-font focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-xl">
              🔍
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Trending Tags */}
        <div className="mb-6">
          <h3 className="text-xl adventure-font text-white mb-4 flex items-center">
            <span className="mr-2">🔥</span>
            TRENDING ADVENTURES
          </h3>
          <div className="flex flex-wrap gap-3">
            {TRENDING_TAGS.map((tag) => (
              <button
                key={tag.name}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg adventure-font text-sm cursor-pointer hover:scale-105 transition-all border border-purple-400/30"
                onClick={() => setSearchQuery(tag.name.substring(1))}
              >
                {tag.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results or Recommended Events */}
        <div>
          <h3 className="font-bold text-gray-800 mb-3">
            {searchQuery ? `Search Results for "${searchQuery}"` : "Recommended for You"}
          </h3>
          
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {searchQuery ? "No events found" : "No events available"}
              </h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? "Try searching with different keywords" 
                  : "Check back later for new events!"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  borderColor=""
                  onOpenChat={onOpenChat}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
