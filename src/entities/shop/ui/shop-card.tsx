import { cn } from "@/shared/lib/utils";

type ShopCardProps = {
  name: string;
  tags: string[];
  area: string;
  open: boolean;
};

export function ShopCard({ name, tags, area, open }: ShopCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-card bg-card p-3">
      <div className="size-18 shrink-0 rounded-card bg-gray-100" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-body font-semibold text-ink">
          {name}
        </span>
        <span className="truncate text-secondary text-gray-400">
          {[...tags, area].join(" · ")}
        </span>
        <span
          className={cn(
            "text-secondary font-semibold",
            open ? "text-open" : "text-gray-400",
          )}
        >
          {open ? "영업중" : "영업종료"}
        </span>
      </div>
    </div>
  );
}
