import { Home, Layers, Repeat, Users, MessageCircle, Calendar, Star, User, Settings, ClipboardList } from "lucide-react";

export const navigation = [
  { name: "Home", icon: Home, to: "/dashboard" },
  { name: "My Skills", icon: Layers, to: "/my-skills" },
  { name: "Swap Requests", icon: Repeat, to: "/swap-requests" },
  { name: "Team Finder", icon: Users, to: "/teams" },
  { name: "My Team Requests", icon: ClipboardList, to: "/team-requests" },
  { name: "Chat", icon: MessageCircle, to: "/chat" },
  { name: "Meet", icon: Calendar, to: "/meet" },
  { name: "Ratings", icon: Star, to: "/ratings" },
  { name: "Profile", icon: User, to: "/profile" },
  { name: "Settings", icon: Settings, to: "/settings" },
];