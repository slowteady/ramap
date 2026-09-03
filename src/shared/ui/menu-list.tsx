"use client";

import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

export type MenuItem = {
  icon: LucideIcon;
  label: string;
} & ({ href: string } | { action: string });

export type MenuSection = { label: string; items: MenuItem[] };

export function MenuList({
  sections,
  onAction,
}: {
  sections: MenuSection[];
  onAction?: (action: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {sections.map((section) => (
        <section key={section.label} className="flex flex-col">
          <h2 className="px-4 pb-1 text-caption font-semibold text-gray-400">
            {section.label}
          </h2>
          {section.items.map((item) => {
            const inner = (
              <>
                <item.icon className="size-4.5 shrink-0 text-gray-500" />
                <span className="flex-1 text-body text-ink">{item.label}</span>
                <ChevronRight className="size-4 shrink-0 text-gray-300" />
              </>
            );
            return "href" in item ? (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3.5"
              >
                {inner}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                onClick={() => onAction?.(item.action)}
                className="flex items-center gap-3 px-4 py-3.5 text-left"
              >
                {inner}
              </button>
            );
          })}
        </section>
      ))}
    </div>
  );
}
