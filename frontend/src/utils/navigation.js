import { Home, Layers, Repeat, Users, MessageCircle, Calendar, Star, User, Settings, BookOpen } from "lucide-react";

export const navigation = [
  { name: "Home", icon: Home, to: "/dashboard" },
  { name: "My Skills", icon: Layers, to: "/my-skills" },
  { name: "Swap Requests", icon: Repeat, to: "/swap-requests" },
  { name: "Team Finder", icon: Users, to: "/teams" },
  { name: "Chat", icon: MessageCircle, to: "/chat" },
  { name: "Meet", icon: Calendar, to: "/meet" },
  { name: "Classes", icon: BookOpen, to: "/classes" },
  { name: "Profile", icon: User, to: "/profile" },
  { name: "Settings", icon: Settings, to: "/settings" },
];
