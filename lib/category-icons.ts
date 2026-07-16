import {
  HandCoins,
  Bike,
  Tv,
  Plug,
  Home,
  User,
  Shapes,
  Wallet,
  Car,
  Utensils,
  ShoppingCart,
  HeartPulse,
  GraduationCap,
  Plane,
  Gift,
  Dog,
  Phone,
  Wifi,
  Dumbbell,
  BookOpen,
  Coffee,
  Tag,
  type LucideIcon,
} from "lucide-react";

/** Curated set (not all ~1500 lucide icons) so the picker stays a short, scannable list. */
export const CATEGORY_ICON_OPTIONS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "tag", label: "General", icon: Tag },
  { value: "hand-coins", label: "Loans", icon: HandCoins },
  { value: "bike", label: "Motorcycle", icon: Bike },
  { value: "car", label: "Car", icon: Car },
  { value: "tv", label: "Subscription", icon: Tv },
  { value: "plug", label: "Utilities", icon: Plug },
  { value: "wifi", label: "Internet", icon: Wifi },
  { value: "home", label: "Rent/Home", icon: Home },
  { value: "user", label: "Personal", icon: User },
  { value: "wallet", label: "Finance", icon: Wallet },
  { value: "utensils", label: "Food", icon: Utensils },
  { value: "coffee", label: "Coffee", icon: Coffee },
  { value: "shopping-cart", label: "Shopping", icon: ShoppingCart },
  { value: "heart-pulse", label: "Health", icon: HeartPulse },
  { value: "graduation-cap", label: "Education", icon: GraduationCap },
  { value: "plane", label: "Travel", icon: Plane },
  { value: "gift", label: "Gifts", icon: Gift },
  { value: "dog", label: "Pets", icon: Dog },
  { value: "phone", label: "Phone", icon: Phone },
  { value: "dumbbell", label: "Fitness", icon: Dumbbell },
  { value: "book-open", label: "Books", icon: BookOpen },
  { value: "shapes", label: "Others", icon: Shapes },
];

const ICON_BY_VALUE = new Map(CATEGORY_ICON_OPTIONS.map((option) => [option.value, option.icon]));

/** Falls back to a generic tag icon for custom categories with no icon set (or an unrecognized value). */
export function getCategoryIcon(iconName?: string | null): LucideIcon {
  return (iconName && ICON_BY_VALUE.get(iconName)) || Tag;
}
