import { Soup } from "lucide-react";

type ShopCardProps = {
  name: string;
  tags: string[];
  area: string | null;
  status?: React.ReactNode;
};

export function ShopCard({ name, tags, area, status }: ShopCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-card bg-card p-3">
      <div className="flex size-14 shrink-0 items-center justify-center rounded-card bg-ramen-050">
        <Soup className="size-6 text-ramen" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-body font-semibold text-ink">
          {name}
        </span>
        {(tags.length > 0 || area) && (
          <span className="truncate text-secondary text-gray-400">
            {[...tags, ...(area ? [area] : [])].join(" · ")}
          </span>
        )}
        {status}
      </div>
    </div>
  );
}
