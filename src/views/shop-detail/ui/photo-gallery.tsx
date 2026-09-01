"use client";

import { useRef, useState } from "react";
import { useDragScroll } from "@/shared/lib/use-drag-scroll";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";

type PhotoGalleryProps = {
  shopName: string;
  photos: string[];
};

export function PhotoGallery({ shopName, photos }: PhotoGalleryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [index, setIndex] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const albumOpen = params.get("photos") === "1";
  const openAlbum = () =>
    router.push(`${pathname}?photos=1`, { scroll: false });
  const closeAlbum = () => router.back();

  const onTrackScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };
  const heroDrag = useDragScroll({ snap: true });
  const viewerDrag = useDragScroll({ snap: true });

  return (
    <>
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={onTrackScroll}
          {...heroDrag.handlers}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`사진 크게 보기 ${i + 1}`}
              onClick={() => {
                if (!heroDrag.dragged()) openAlbum();
              }}
              className="aspect-[4/3] w-full shrink-0 snap-center"
            >
              <img
                src={src}
                alt={`${shopName} 사진 ${i + 1}`}
                loading={i === 0 ? "eager" : "lazy"}
                draggable={false}
                className="size-full object-cover select-none"
              />
            </button>
          ))}
        </div>
        {photos.length > 1 && (
          <span className="absolute right-3 bottom-3 rounded-pill bg-ink/60 px-2 py-0.5 text-caption font-semibold text-white">
            {index + 1}/{photos.length}
          </span>
        )}
      </div>

      {albumOpen && (
        <div className="fixed inset-0 z-50 mx-auto flex w-full max-w-app flex-col bg-white">
          <header className="flex items-center gap-1 px-2 py-2">
            <button
              type="button"
              onClick={closeAlbum}
              aria-label="닫기"
              className="flex size-10 items-center justify-center rounded-pill text-ink"
            >
              <ChevronLeft className="size-5" />
            </button>
            <span className="text-body font-bold text-ink">
              사진 {photos.length}
            </span>
          </header>
          <div className="grid grid-cols-3 gap-0.5 overflow-y-auto overscroll-contain pb-10">
            {photos.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-label={`사진 ${i + 1} 크게 보기`}
                onClick={() => setViewer(i)}
                className="aspect-square"
              >
                <img
                  src={src}
                  alt={`${shopName} 사진 ${i + 1}`}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {albumOpen && viewer !== null && (
        <div className="fixed inset-0 z-50 mx-auto flex w-full max-w-app flex-col bg-ink">
          <header className="flex items-center justify-between px-2 py-2">
            <span className="px-2 text-body font-semibold text-white">
              {viewer + 1}/{photos.length}
            </span>
            <button
              type="button"
              onClick={() => setViewer(null)}
              aria-label="닫기"
              className="flex size-10 items-center justify-center rounded-pill text-white"
            >
              <X className="size-5" />
            </button>
          </header>
          <div
            onScroll={(e) => {
              const el = e.currentTarget;
              setViewer(Math.round(el.scrollLeft / el.clientWidth));
            }}
            {...viewerDrag.handlers}
            className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {photos.map((src, i) => (
              <div
                key={src}
                className="flex w-full shrink-0 snap-center items-center justify-center"
                ref={
                  i === viewer
                    ? (el) => el?.scrollIntoView({ block: "nearest" })
                    : undefined
                }
              >
                <img
                  src={src}
                  alt={`${shopName} 사진 ${i + 1}`}
                  draggable={false}
                  className="max-h-full w-full object-contain select-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
