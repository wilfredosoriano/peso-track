import { Badge } from "@/components/ui/badge";
import { getCategoryIcon } from "@/lib/category-icons";

export function CategoryChip({
  name,
  color,
  icon,
}: {
  name: string;
  color?: string | null;
  icon?: string | null;
}) {
  // getCategoryIcon looks up a stable, pre-existing icon component from a
  // Map — it never creates a new one, so this doesn't reset state on
  // re-render despite the linter's (correctly cautious, here false-positive)
  // static-components heuristic.
  const Icon = getCategoryIcon(icon);
  return (
    <Badge
      variant="secondary"
      className="gap-1"
      style={color ? { backgroundColor: `${color}20`, color } : undefined}
    >
      {/* eslint-disable-next-line react-hooks/static-components */}
      <Icon className="size-3" />
      {name}
    </Badge>
  );
}
