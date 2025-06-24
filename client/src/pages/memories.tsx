import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { EventPhoto, EventParticipant, Event } from "@shared/schema";

export default function MemoriesPage() {
  const { data: photos = [], isLoading: photosLoading } = useQuery<(EventPhoto & { event: Event })[]>({
    queryKey: ["/api/users/me/photos"],
  });

  const { data: participations = [], isLoading: participationsLoading } = useQuery<(EventParticipant & { event: Event })[]>({
    queryKey: ["/api/users/me/participations"],
  });

  const isLoading = photosLoading || participationsLoading;

  const stats = {
    eventsJoined: participations.length,
    photosShared: photos.length,
    newFriends: Math.floor(participations.length * 2.5), // Approximate based on events
  };

  // Group photos by event
  const photosByEvent = photos.reduce((acc, photo) => {
    const eventId = photo.event.id;
    if (!acc[eventId]) {
      acc[eventId] = {
        event: photo.event,
        photos: [],
      };
    }
    acc[eventId].photos.push(photo);
    return acc;
  }, {} as Record<string, { event: Event; photos: (EventPhoto & { event: Event })[] }>);

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="camp-gradient-green p-4 text-white rounded-b-2xl">
          <h2 className="text-xl font-bold mb-2">Summer Memories</h2>
          <p className="text-green-100">Your adventure collection</p>
        </div>
        <div className="p-4 space-y-4">
          <div className="animate-pulse bg-gray-200 rounded-xl h-32"></div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-stone-800 p-6 relative overflow-hidden border-b border-slate-700">
        <div className="absolute top-4 right-8 text-3xl opacity-20">📸</div>
        <div className="absolute bottom-4 left-8 text-2xl opacity-15">🎒</div>
        
        <div className="relative z-10">
          <h2 className="text-3xl adventure-title mb-2 text-emerald-400">SUMMER MEMORIES</h2>
          <p className="text-slate-300 adventure-font text-sm tracking-wide">
            YOUR EPIC ADVENTURE COLLECTION
          </p>
        </div>
      </div>

      <div className="p-6">
        {/* AI Scrapbook Button */}
        <div className="mb-6 bg-gradient-to-br from-slate-800 to-stone-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 p-6 text-white relative overflow-hidden">
            <div className="absolute top-2 right-4 text-3xl opacity-30">✨</div>
            <div className="absolute bottom-2 left-4 text-2xl opacity-25">📖</div>
            
            <div className="relative z-10">
              <h3 className="text-xl adventure-title text-white mb-2 flex items-center">
                <span className="text-2xl mr-2">✨</span>
                AI SCRAPBOOK MAGIC
              </h3>
              <p className="text-sm text-white/95 mb-4 adventure-font">
                Turn your epic summer adventures into a beautiful digital scrapbook with AI magic!
              </p>
              <Button 
                className="bg-white text-purple-600 hover:bg-gray-100 px-6 py-3 rounded-xl adventure-font text-sm shadow-lg border border-white/20"
                disabled
              >
                <span className="mr-2">🎨</span>
                GENERATE SCRAPBOOK (COMING SOON)
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Memories */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-3">Recent Adventures</h3>
          
          {Object.keys(photosByEvent).length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📸</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No memories yet</h3>
              <p className="text-gray-600">
                Join events and start sharing photos to build your memory collection!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {Object.values(photosByEvent).map(({ event, photos }) => (
                <div key={event.id} className="relative rounded-lg overflow-hidden">
                  <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500 relative">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white text-xs font-medium">{event.title}</p>
                      <p className="text-white/80 text-xs">{photos.length} photo{photos.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Memory Stats */}
        <div className="bg-gradient-to-br from-slate-800 to-stone-800 rounded-xl border border-slate-700 shadow-xl">
          <div className="p-6">
            <h4 className="text-xl adventure-title text-emerald-400 mb-4">YOUR SUMMER STATS</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                <p className="text-2xl adventure-font text-emerald-400">{Object.keys(photosByEvent).length}</p>
                <p className="text-xs text-slate-300 adventure-font">EVENTS CAPTURED</p>
              </div>
              <div className="text-center bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                <p className="text-2xl adventure-font text-teal-400">{photos.length}</p>
                <p className="text-xs text-slate-300 adventure-font">TOTAL PHOTOS</p>
              </div>
              <div className="text-center bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                <p className="text-2xl adventure-font text-blue-400">{participations.length}</p>
                <p className="text-xs text-slate-300 adventure-font">ADVENTURES JOINED</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
