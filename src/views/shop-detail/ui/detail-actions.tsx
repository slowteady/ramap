"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Map, Navigation, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerTitle } from "@/shared/ui/drawer";
import { directionLinks, type DirectionTarget } from "../model/directions";

type DetailActionsProps = {
  shopId: string;
  target: DirectionTarget;
};

const ACTION_CLASS =
  "flex flex-1 flex-col items-center gap-1 py-2 text-caption font-semibold text-ink";

export function DetailActions({ shopId, target }: DetailActionsProps) {
  const [directionsOpen, setDirectionsOpen] = useState(false);
  const links = directionLinks(target);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${target.name} — 라맵`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast("링크를 복사했어요");
    } catch {
      /* 공유 시트 취소는 정상 종료 */
    }
  };

  return (
    <>
      <div className="flex items-center rounded-card bg-gray-050">
        <Link href={`/?shop=${shopId}`} className={ACTION_CLASS}>
          <Map className="size-5" />
          지도
        </Link>
        <button
          type="button"
          onClick={() => setDirectionsOpen(true)}
          className={ACTION_CLASS}
        >
          <Navigation className="size-5" />
          길찾기
        </button>
        <button type="button" onClick={share} className={ACTION_CLASS}>
          <Share2 className="size-5" />
          공유
        </button>
      </div>
      {directionsOpen && (
        <Drawer open onOpenChange={(next) => !next && setDirectionsOpen(false)}>
          <DrawerContent>
            <div className="flex flex-col px-4 pt-4 pb-6">
              <DrawerTitle className="pb-2 text-title font-bold text-ink">
                길찾기
              </DrawerTitle>
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setDirectionsOpen(false)}
                  className="flex h-13 items-center justify-between border-b border-gray-050 text-body font-semibold text-ink last:border-b-0"
                >
                  {link.label}
                  <ExternalLink className="size-4 text-gray-300" />
                </a>
              ))}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
