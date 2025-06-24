import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Event, EventParticipant } from "@shared/schema";

export default function ProfilePage() {
  const { user } = useAuth();

  const { data: createdEvents = [] } = useQuery<Event[]>({
    queryKey: ["/api/users/me/events"],
  });

  const { data: participations = [] } = useQuery<(EventParticipant & { event: Event })[]>({
    queryKey: ["/api/users/me/participations"],
  });

  if (!user) return null;

  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.email?.split('@')[0] || 'Microsoft Intern';

  const initials = user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : (user.email?.[0] || 'M').toUpperCase();

  const interests = user.interests || ['Tech', 'Networking', 'Seattle'];

  const getInterestColor = (interest: string) => {
    const colors = {
      'tech': 'bg-blue-100 text-blue-800',
      'hiking': 'bg-green-100 text-green-800',
      'food': 'bg-orange-100 text-orange-800',
      'photography': 'bg-purple-100 text-purple-800',
      'networking': 'bg-indigo-100 text-indigo-800',
      'seattle': 'bg-cyan-100 text-cyan-800',
    };
    return colors[interest.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const recentActivity = [
    ...participations.slice(0, 2).map(p => ({
      type: 'join',
      text: `Joined ${p.event.title}`,
      time: new Date(p.joinedAt).toLocaleDateString(),
      icon: '📅',
      color: 'bg-green-500',
    })),
    ...createdEvents.slice(0, 1).map(e => ({
      type: 'create',
      text: `Created ${e.title}`,
      time: new Date(e.createdAt).toLocaleDateString(),
      icon: '➕',
      color: 'bg-orange-500',
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 3);

  return (
    <div>
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-slate-800 via-stone-800 to-slate-900 p-6 text-white relative overflow-hidden border-b border-slate-700">
        <div className="absolute top-4 right-8 text-4xl opacity-20">🎯</div>
        <div className="absolute bottom-4 left-8 text-3xl opacity-15">⭐</div>
        
        <div className="flex items-center space-x-6 mb-8 relative z-10">
          <Avatar className="w-28 h-28 border-4 border-emerald-400 shadow-2xl">
            <AvatarImage src={user.profileImageUrl || ''} alt={displayName} />
            <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-emerald-600 to-teal-600 text-white adventure-font">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-3xl adventure-title mb-2 text-emerald-400">{displayName}</h2>
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 rounded-xl inline-block mb-2 border border-emerald-400/30">
              <p className="text-sm adventure-font text-white">SOFTWARE ENGINEERING INTERN</p>
            </div>
            <p className="text-slate-300 adventure-font text-sm">{user.team || 'MICROSOFT TEAM'}</p>
          </div>
        </div>
        
        {/* Profile Stats */}
        <div className="grid grid-cols-3 gap-4 relative z-10">
          <div className="text-center bg-gradient-to-br from-emerald-600/20 to-teal-600/20 backdrop-blur-md rounded-xl p-4 border border-emerald-400/30">
            <div className="text-3xl mb-2">🎪</div>
            <p className="adventure-font text-2xl text-white">{createdEvents.length}</p>
            <p className="text-xs text-slate-300 adventure-font">EVENTS CREATED</p>
          </div>
          <div className="text-center bg-gradient-to-br from-amber-600/20 to-orange-600/20 backdrop-blur-md rounded-xl p-4 border border-amber-400/30">
            <div className="text-3xl mb-2">🏔️</div>
            <p className="adventure-font text-2xl text-white">{participations.length}</p>
            <p className="text-xs text-slate-300 adventure-font">ADVENTURES JOINED</p>
          </div>
          <div className="text-center bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-xl p-4 border border-purple-400/30">
            <div className="text-3xl mb-2">🤝</div>
            <p className="adventure-font text-2xl text-white">{Math.floor(participations.length * 2.5)}</p>
            <p className="text-xs text-slate-300 adventure-font">CONNECTIONS</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* About Section */}
        <div className="bg-gradient-to-br from-slate-800 to-stone-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
          <div className="p-6 relative">
            <div className="absolute top-4 right-4 text-2xl opacity-20">📝</div>
            <h3 className="text-xl adventure-title text-emerald-400 mb-4">ABOUT THIS ADVENTURER</h3>
            <p className="text-slate-300 adventure-font text-sm leading-relaxed">
              {user.bio || "LOVE EXPLORING SEATTLE, TRYING NEW FOOD SPOTS, AND CONNECTING WITH FELLOW INTERNS! ALWAYS UP FOR A GOOD HIKE OR TECH MEETUP 🚀"}
            </p>
            
            {/* Interest Tags */}
            <div className="flex flex-wrap gap-3 mt-4">
              {["HIKING", "TECH", "FOOD", "GAMING", "MUSIC"].map((interest) => (
                <span 
                  key={interest}
                  className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg text-xs adventure-font border border-emerald-400/30"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-slate-800 to-stone-800 rounded-xl border border-slate-700 shadow-xl">
          <div className="p-6">
            <h3 className="text-xl adventure-title text-emerald-400 mb-4">RECENT ACTIVITY</h3>
            {recentActivity.length === 0 ? (
              <p className="text-slate-400 adventure-font text-sm">NO RECENT ACTIVITY</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 text-sm bg-slate-700/30 rounded-lg p-3 border border-slate-600">
                    <div className={`w-3 h-3 rounded-full ${activity.color}`}></div>
                    <span className="text-slate-300 adventure-font flex-1">{activity.text}</span>
                    <span className="text-slate-400 adventure-font text-xs">
                      {format(new Date(activity.time), 'MMM d').toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className="pt-4">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/api/logout'}
            className="w-full border-2 border-red-500/30 text-red-300 hover:bg-red-600/20 adventure-font py-4 rounded-xl"
          >
            SIGN OUT
          </Button>
        </div>
      </div>
    </div>
  );
}
