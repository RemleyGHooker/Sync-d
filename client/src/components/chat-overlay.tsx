import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import type { ChatMessage, User, Event } from "@shared/schema";

interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string | null;
}

export default function ChatOverlay({ isOpen, onClose, eventId }: ChatOverlayProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: event } = useQuery<Event>({
    queryKey: ["/api/events", eventId],
    enabled: !!eventId,
  });

  const { data: messages = [], isLoading } = useQuery<(ChatMessage & { user: User })[]>({
    queryKey: ["/api/events", eventId, "messages"],
    enabled: !!eventId && isOpen,
    refetchInterval: 1000, // Poll for new messages every second
  });

  const { socket } = useSocket();

  // Listen for new messages via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat_message' && data.eventId === eventId) {
          queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "messages"] });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, eventId, queryClient]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!eventId) throw new Error('No event ID');
      return apiRequest(`/api/events/${eventId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "messages"] });
      setNewMessage("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !eventId || !user || sendMutation.isPending) return;
    sendMutation.mutate(newMessage.trim());
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex h-full">
        {/* Backdrop */}
        <div 
          className="flex-1 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Chat Panel */}
        <div className="w-full max-w-sm bg-gradient-to-br from-slate-800 to-stone-800 flex flex-col shadow-2xl border-l border-slate-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="adventure-font text-lg">EVENT CHAT</h3>
              <button 
                onClick={onClose}
                className="text-white/80 hover:text-white text-xl adventure-font"
              >
                ✕
              </button>
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
            {isLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-400"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-slate-400 adventure-font text-sm">
                NO MESSAGES YET. BE THE FIRST TO SAY HELLO!
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs adventure-font text-emerald-400">
                      {(message.user.firstName || 'ANONYMOUS').toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400 adventure-font">
                      {format(new Date(message.createdAt), 'h:mm a').toUpperCase()}
                    </span>
                  </div>
                  <div className="bg-slate-700/80 rounded-lg p-3 text-sm text-slate-200 border border-slate-600">
                    {message.content}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-700 bg-slate-800/50">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 bg-slate-700 text-white border border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400 adventure-font"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sendMutation.isPending}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg adventure-font text-sm hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-400/30"
              >
                {sendMutation.isPending ? '...' : 'SEND'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
