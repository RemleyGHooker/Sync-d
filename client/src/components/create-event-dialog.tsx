import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { insertEventSchema } from "@shared/schema";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EVENT_TYPES = [
  { value: "party", label: "Party", emoji: "🎉" },
  { value: "hiking", label: "Hiking", emoji: "🥾" },
  { value: "food", label: "Food", emoji: "🍕" },
  { value: "gaming", label: "Gaming", emoji: "🎮" },
  { value: "networking", label: "Networking", emoji: "💼" },
  { value: "beach", label: "Beach", emoji: "🏖️" },
  { value: "shopping", label: "Shopping", emoji: "🛍️" },
  { value: "other", label: "Other", emoji: "📅" },
];

const COMMON_TAGS = [
  "rooftop", "mixer", "hiking", "outdoors", "food", "drinks", "networking",
  "tech", "gaming", "beach", "shopping", "music", "art", "photography",
  "seattle", "downtown", "capitol-hill", "fremont", "ballard",
];

const formSchema = insertEventSchema.extend({
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional(),
  maxCapacity: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateEventDialog({ open, onOpenChange }: CreateEventDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      eventType: "",
      startTime: "",
      endTime: "",
      location: "",
      meetingSpot: "",
      maxCapacity: "",
      imageUrl: "",
      tags: [],
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const eventData = {
        ...data,
        startTime: new Date(data.startTime).toISOString(),
        endTime: data.endTime ? new Date(data.endTime).toISOString() : undefined,
        maxCapacity: data.maxCapacity ? parseInt(data.maxCapacity) : undefined,
        tags: selectedTags,
      };
      return await apiRequest("POST", "/api/events", eventData);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Event created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      form.reset();
      setSelectedTags([]);
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Create event error:", error);
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
        description: error.message || "Failed to create event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createEventMutation.mutate(data);
  };

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-white border border-slate-200 text-slate-800 posh-shadow-lg">
        <DialogHeader>
          <div className="text-center">
            <div className="text-4xl mb-4">✨</div>
            <DialogTitle className="text-2xl posh-title mb-2 text-slate-800">
              Create Event
            </DialogTitle>
            <p className="text-slate-600 posh-font text-sm">
              Plan a premium networking experience
            </p>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title" className="posh-font text-slate-700">Event Title</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Executive Networking Mixer"
              className="mt-1 posh-font"
            />
            {form.formState.errors.title && (
              <p className="text-red-500 text-sm mt-1 posh-font">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="eventType" className="posh-font text-slate-700">Event Type</Label>
            <Select onValueChange={(value) => form.setValue("eventType", value)}>
              <SelectTrigger className="mt-1 posh-font">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="posh-font">
                    {type.emoji} {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.eventType && (
              <p className="text-red-500 text-sm mt-1 posh-font">{form.formState.errors.eventType.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description" className="posh-font text-slate-700">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Tell everyone what makes this event special..."
              className="mt-1 posh-font"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="startTime" className="posh-font text-slate-700">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                {...form.register("startTime")}
                className="mt-1 posh-font"
              />
              {form.formState.errors.startTime && (
                <p className="text-red-500 text-sm mt-1 posh-font">{form.formState.errors.startTime.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="endTime" className="posh-font text-slate-700">End Time (Optional)</Label>
              <Input
                id="endTime"
                type="datetime-local"
                {...form.register("endTime")}
                className="mt-1 posh-font"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location" className="posh-font text-slate-700">Location</Label>
            <Input
              id="location"
              {...form.register("location")}
              placeholder="Capitol Hill, Seattle"
              className="mt-1 posh-font"
            />
            {form.formState.errors.location && (
              <p className="text-red-500 text-sm mt-1 posh-font">{form.formState.errors.location.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="meetingSpot" className="posh-font text-slate-700">Meeting Spot (Optional)</Label>
            <Input
              id="meetingSpot"
              {...form.register("meetingSpot")}
              placeholder="Starbucks on Pine Street"
              className="mt-1 posh-font"
            />
          </div>

          <div>
            <Label htmlFor="maxCapacity" className="posh-font text-slate-700">Max Capacity (Optional)</Label>
            <Input
              id="maxCapacity"
              type="number"
              {...form.register("maxCapacity")}
              placeholder="Leave empty for unlimited"
              className="mt-1 posh-font"
            />
          </div>

          <div>
            <Label htmlFor="imageUrl" className="posh-font text-slate-700">Image URL (Optional)</Label>
            <Input
              id="imageUrl"
              {...form.register("imageUrl")}
              placeholder="https://example.com/image.jpg"
              className="mt-1 posh-font"
            />
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2 mb-2">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {COMMON_TAGS.filter(tag => !selectedTags.includes(tag)).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100 text-xs"
                  onClick={() => addTag(tag)}
                >
                  + {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createEventMutation.isPending}
              className="flex-1 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white posh-font text-base transform hover:scale-105 transition-all"
            >
              {createEventMutation.isPending ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
