import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { LegalSection } from "../model/legal-content";

export function LegalPage({
  title,
  effective,
  sections,
}: {
  title: string;
  effective: string;
  sections: LegalSection[];
}) {
  return (
    <div className="flex min-h-dvh flex-col pb-16">
      <header className="flex items-center px-2 py-2">
        <Link
          href="/"
          aria-label="지도로 돌아가기"
          className="flex size-10 items-center justify-center rounded-pill text-ink"
        >
          <ChevronLeft className="size-5" />
        </Link>
      </header>
      <div className="flex flex-col gap-1 px-4 pt-1">
        <h1 className="text-heading font-extrabold text-ink">{title}</h1>
        <p className="text-secondary text-gray-400">시행일 {effective}</p>
      </div>
      <div className="flex flex-col gap-6 px-4 pt-6">
        {sections.map((section) => (
          <section key={section.title} className="flex flex-col gap-1.5">
            <h2 className="text-body font-bold text-ink">{section.title}</h2>
            {section.body.map((line) => (
              <p
                key={line}
                className="text-secondary leading-relaxed text-gray-500"
              >
                {line}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
