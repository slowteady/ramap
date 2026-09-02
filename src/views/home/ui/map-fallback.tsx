import {
  OpenStatusBadge,
  ShopCard,
  soupBySlug,
  type ShopPin,
} from "@/entities/shop";

function groupByArea(pins: ShopPin[]): Map<string, ShopPin[]> {
  const groups = new Map<string, ShopPin[]>();
  for (const pin of pins) {
    const key = pin.areaLabel ?? pin.district ?? "서울";
    groups.set(key, [...(groups.get(key) ?? []), pin]);
  }
  return groups;
}

export function MapFallback({ pins }: { pins: ShopPin[] }) {
  const groups = groupByArea(pins);
  return (
    <div className="flex flex-col gap-4 px-4 pb-8">
      <div className="rounded-card bg-gray-050 p-3 text-secondary text-gray-500">
        지도를 불러오지 못했어요. 목록으로 보여드릴게요.
      </div>
      {[...groups.entries()].map(([area, shops]) => (
        <section key={area} className="flex flex-col gap-2">
          <h2 className="text-body font-bold text-ink">{area}</h2>
          {shops.map((shop) => (
            <ShopCard
              key={shop.id}
              name={shop.name}
              tags={shop.soups
                .filter((s) => s !== "etc-soup")
                .map((s) => soupBySlug(s)?.label ?? s)}
              area={null}
              status={
                <OpenStatusBadge
                  status={shop.status}
                  hours={shop.hours}
                  breakTime={shop.breakTime}
                  closedDays={shop.closedDays}
                />
              }
            />
          ))}
        </section>
      ))}
    </div>
  );
}
