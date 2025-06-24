import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { format } from "date-fns";
import type { Event, EventParticipant, User } from "@shared/schema";

interface EventCardProps {
  event: Event;
  borderColor: string;
  onOpenChat: (eventId: string) => void;
}

export default function EventCard({ event, borderColor, onOpenChat }: EventCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isJoined, setIsJoined] = useState(false);

  const { data: participants = [] } = useQuery<(EventParticipant & { user: User })[]>({
    queryKey: ["/api/events", event.id, "participants"],
  });

  const { data: userParticipations = [] } = useQuery<(EventParticipant & { event: Event })[]>({
    queryKey: ["/api/users/me/participations"],
    enabled: !!user,
  });

  // Check if user has already joined this event
  const hasJoined = userParticipations.some(p => p.event.id === event.id);

  const joinMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/events/${event.id}/join`);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: `You've joined ${event.title}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events", event.id, "participants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/me/participations"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to join event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/events/${event.id}/leave`);
    },
    onSuccess: () => {
      toast({
        title: "Left event",
        description: `You've left ${event.title}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events", event.id, "participants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/me/participations"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to leave event. Please try again.",
        variant: "destructive",
      });
    },
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

  const participantCount = participants.length;
  const capacityText = event.maxCapacity 
    ? `${participantCount}/${event.maxCapacity} spots`
    : `${participantCount} joined`;

  const canJoin = !event.maxCapacity || participantCount < event.maxCapacity;

  return (
    <div className="bg-white rounded-xl posh-border hover:scale-105 transition-all duration-300 overflow-hidden posh-shadow hover:shadow-lg">
      <div className="h-32 relative overflow-hidden">
        {event.imageUrl ? (
          <img 
            src={event.imageUrl} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-violet-200">
            <span className="text-5xl opacity-90">{getEventTypeEmoji(event.eventType)}</span>
          </div>
        )}
      </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="px-3 py-1 bg-violet-100 text-violet-700 text-xs posh-font rounded-full">
              {event.eventType}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs posh-font rounded-full">
              {event.maxCapacity ? capacityText : "Open"}
            </span>
          </div>
          
          <h4 className="posh-title text-slate-800 mb-2 text-base">{event.title}</h4>
          <p className="text-slate-600 text-sm mb-4 line-clamp-2 posh-font">{event.description}</p>
          
          <div className="flex items-center text-xs text-slate-500 space-x-3 mb-3 posh-font">
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {format(new Date(event.startTime), 'EEE h:mm a')}
            </span>
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.location}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {participants.slice(0, 3).map((participant, index) => (
                <Avatar key={participant.id} className="w-6 h-6 border-2 border-white">
                  <AvatarImage src={participant.user.profileImageUrl || ''} />
                  <AvatarFallback className="text-xs bg-violet-100 text-violet-700">
                    {participant.user.firstName?.[0] || participant.user.email?.[0] || 'M'}
                  </AvatarFallback>
                </Avatar>
              ))}
              {participantCount > 3 && (
                <div className="w-6 h-6 bg-slate-100 rounded-full border-2 border-white flex items-center justify-center text-xs text-slate-600">
                  +{participantCount - 3}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {hasJoined && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChat(event.id)}
                  className="text-xs px-3 py-1 posh-font border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Chat
                </Button>
              )}
              
              {hasJoined ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => leaveMutation.mutate()}
                  disabled={leaveMutation.isPending}
                  className="posh-font text-xs px-4 py-2 border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  {leaveMutation.isPending ? "Leaving..." : "Leave"}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => joinMutation.mutate()}
                  disabled={joinMutation.isPending || !canJoin}
                  className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white px-4 py-2 rounded-lg posh-font transform hover:scale-105 transition-all"
                >
                  {joinMutation.isPending ? "Joining..." : "Join"}
                </Button>
              )}
            </div>
          </div>
        </div>
    </div>
  );
}
