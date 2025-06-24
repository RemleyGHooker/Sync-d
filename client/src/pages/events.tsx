import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EventCard from "@/components/event-card";
import CreateEventDialog from "@/components/create-event-dialog";
import { format, isThisWeek, isAfter, startOfWeek, endOfWeek } from "date-fns";
import type { Event } from "@shared/schema";

interface EventsPageProps {
  onOpenChat: (eventId: string) => void;
}

const EVENT_TAGS = [
  { name: "All", emoji: "🌟", color: "bg-orange-500" },
  { name: "Parties", emoji: "🎉", color: "bg-purple-500" },
  { name: "Hiking", emoji: "🥾", color: "bg-green-500" },
  { name: "Shopping", emoji: "🛍️", color: "bg-pink-500" },
  { name: "Food", emoji: "🍕", color: "bg-red-500" },
  { name: "Gaming", emoji: "🎮", color: "bg-blue-500" },
  { name: "Networking", emoji: "💼", color: "bg-indigo-500" },
  { name: "Beach", emoji: "🏖️", color: "bg-cyan-500" },
];

export default function EventsPage({ onOpenChat }: EventsPageProps) {
  const [selectedTag, setSelectedTag] = useState("All");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const filteredEvents = events.filter(event => {
    if (selectedTag === "All") return true;
    return event.tags?.includes(selectedTag.toLowerCase());
  });

  const categorizeEvents = (events: Event[]) => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    
    return {
      thisWeek: events.filter(event => {
        const eventDate = new Date(event.startTime);
        return eventDate >= weekStart && eventDate <= weekEnd;
      }),
      nextWeek: events.filter(event => {
        const eventDate = new Date(event.startTime);
        const nextWeekStart = new Date(weekEnd);
        nextWeekStart.setDate(nextWeekStart.getDate() + 1);
        const nextWeekEnd = new Date(nextWeekStart);
        nextWeekEnd.setDate(nextWeekEnd.getDate() + 6);
        return eventDate >= nextWeekStart && eventDate <= nextWeekEnd;
      }),
      later: events.filter(event => {
        const eventDate = new Date(event.startTime);
        const nextWeekEnd = new Date(weekEnd);
        nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);
        return eventDate > nextWeekEnd;
      }),
    };
  };

  const categorizedEvents = categorizeEvents(filteredEvents);

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="camp-gradient-blue p-4 text-white rounded-b-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Tripp'In</h1>
              <p className="text-blue-100">Seattle Summer Adventures</p>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl posh-title text-slate-800 mb-1">
              Tripp'In
            </h1>
            <p className="posh-subtitle text-sm">
              Premium networking events
            </p>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white px-6 py-3 rounded-lg posh-font transform hover:scale-105 transition-all posh-shadow"
          >
            <span className="text-base mr-2">+</span>
            <span>Create Event</span>
          </Button>
        </div>
        
        {/* Filter Tags */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {EVENT_TAGS.map((tag) => (
            <button
              key={tag.name}
              className={`px-4 py-2 rounded-lg posh-font text-sm transition-all whitespace-nowrap border ${
                selectedTag === tag.name 
                  ? "bg-violet-100 text-violet-700 border-violet-200" 
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
              onClick={() => setSelectedTag(tag.name)}
            >
              {tag.emoji} {tag.name}
            </button>
          ))}
        </div>
      </div>

      {/* Event Grid */}
      <div className="p-6 bg-slate-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'This Week', events: categorizedEvents.thisWeek },
            { name: 'Next Week', events: categorizedEvents.nextWeek },
            { name: 'Later', events: categorizedEvents.later }
          ].map((timeframe, index) => {
            const columnStyles = [
              'border-violet-200 bg-violet-50',
              'border-blue-200 bg-blue-50', 
              'border-slate-200 bg-slate-100'
            ];

            return (
              <div key={timeframe.name} className={`rounded-xl ${columnStyles[index]} border p-6 posh-shadow`}>
                <h3 className="posh-title text-slate-800 mb-6 text-center text-lg">{timeframe.name}</h3>
                <div className="space-y-4">
                  {timeframe.events.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl posh-border">
                      <div className="text-4xl mb-3">📅</div>
                      <p className="text-sm text-slate-500 posh-font">No events scheduled</p>
                    </div>
                  ) : (
                    timeframe.events.map((event) => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        borderColor=""
                        onOpenChat={onOpenChat}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <CreateEventDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
    </div>
  );
}
