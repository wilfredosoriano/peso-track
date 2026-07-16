import {
  LayoutDashboard,
  Receipt,
  Calendar,
  Shapes,
  BarChart3,
  Repeat,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bills", label: "Bills", icon: Receipt },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/categories", label: "Categories", icon: Shapes },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/recurring", label: "Recurring", icon: Repeat },
  { href: "/settings", label: "Settings", icon: Settings },
];

export const MOBILE_TAB_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bills", label: "Bills", icon: Receipt },
  { href: "/calendar", label: "Calendar", icon: Calendar },
];
