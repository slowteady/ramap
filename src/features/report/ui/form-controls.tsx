"use client";

import { Check } from "lucide-react";
import type { TaxonomyItem } from "@/entities/shop";
import { cn } from "@/shared/lib/utils";

const INPUT_CLASS =
  "w-full rounded-card bg-gray-050 px-3 py-2.5 text-body text-ink outline-none placeholder:text-gray-300";

export function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-secondary font-semibold text-ink">
        {label}
        {optional && (
          <span className="pl-1 font-normal text-gray-300">(선택)</span>
        )}
      </span>
      {children}
    </label>
  );
}

export function TextInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return <input {...props} className={cn(INPUT_CLASS, className)} />;
}

export function TextArea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      rows={3}
      {...props}
      className={cn(INPUT_CLASS, "resize-none", className)}
    />
  );
}

/* 홈 필터 시트의 3열 사각 칩과 같은 언어 */
export function ChipGrid({
  items,
  selected,
  onToggle,
}: {
  items: readonly TaxonomyItem[];
  selected: string[];
  onToggle: (slug: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item) => {
        const on = selected.includes(item.slug);
        return (
          <button
            key={item.slug}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(item.slug)}
            className={cn(
              "rounded-card border px-3 py-2.5 text-left text-body font-semibold transition-colors duration-150",
              on
                ? "border-ramen bg-ramen-050 text-ramen"
                : "border-gray-100 bg-white text-ink",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export function CheckRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className="flex items-center gap-2.5 py-2.5 text-left"
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-chip border transition-colors duration-150",
          checked
            ? "border-ramen bg-ramen text-white"
            : "border-gray-200 bg-white",
        )}
      >
        {checked && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      <span
        className={cn(
          "text-body",
          checked ? "font-semibold text-ink" : "text-gray-500",
        )}
      >
        {label}
      </span>
    </button>
  );
}

export function SegmentedPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => {
        const on = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 rounded-pill border py-2 text-secondary font-semibold transition-colors duration-150",
              on
                ? "border-ramen bg-ramen-050 text-ramen"
                : "border-gray-100 bg-white text-ink",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function SubmitBar({
  disabled,
  submitting,
  onSubmit,
  notice,
}: {
  disabled: boolean;
  submitting: boolean;
  onSubmit: () => void;
  notice: string;
}) {
  return (
    <div className="flex flex-col gap-3 pt-2">
      <button
        type="button"
        disabled={disabled}
        onClick={onSubmit}
        className="w-full rounded-pill bg-ramen py-3 text-body font-bold text-white disabled:opacity-40"
      >
        {submitting ? "제출 중…" : "제출하기"}
      </button>
      <p className="text-caption text-gray-400">{notice}</p>
    </div>
  );
}

export function DoneView({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-4 pb-16">
      <h2 className="text-heading font-extrabold text-ink">제보 감사합니다</h2>
      <p className="text-center text-body text-gray-500">
        확인 후 지도에 반영할게요.
        <br />
        모든 제보는 검수를 거쳐 게재됩니다.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-4 rounded-pill bg-ink px-6 py-3 text-body font-bold text-white"
      >
        닫기
      </button>
    </div>
  );
}
