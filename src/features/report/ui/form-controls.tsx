"use client";

import { Check } from "lucide-react";
import type { TaxonomyItem } from "@/entities/shop";
import { cn } from "@/shared/lib/utils";

/* 포커스는 보더 반전으로 표시(토스·당근) — 유채색 링 금지, 색이 있는 곳 = 누를 수 있는 곳 */
const INPUT_CLASS =
  "w-full rounded-card border border-transparent bg-gray-050 px-3 py-2.5 text-body text-ink outline-none transition-colors duration-150 placeholder:text-gray-300 focus:border-ink focus:bg-white aria-invalid:border-ramen";

export function Field({
  label,
  required,
  optional,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-secondary font-semibold text-ink">
        {label}
        {required && <span className="text-ramen"> *</span>}
        {optional && (
          <span className="pl-1 font-normal text-gray-400">(선택)</span>
        )}
      </span>
      {children}
      {error ? (
        <span className="text-caption text-ramen">{error}</span>
      ) : (
        hint && <span className="text-caption text-gray-400">{hint}</span>
      )}
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
      className={cn(INPUT_CLASS, "shrink-0 resize-none", className)}
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

export { PhotoPicker } from "@/shared/ui/photo-picker";

export function BottomCta({
  label,
  disabled,
  submitting,
  onSubmit,
}: {
  label: string;
  disabled: boolean;
  submitting: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-3">
      <button
        type="button"
        disabled={disabled}
        onClick={onSubmit}
        className="flex h-12 w-full items-center justify-center rounded-card bg-ramen text-body font-bold text-white disabled:opacity-40"
      >
        {submitting ? "보내는 중…" : label}
      </button>
    </div>
  );
}

export function DoneView({
  title,
  description,
  onClose,
}: {
  title: string;
  description: string;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 pb-16 text-center">
      <h2 className="text-heading font-extrabold text-ink">{title}</h2>
      <p className="text-body text-gray-500">{description}</p>
      <button
        type="button"
        onClick={onClose}
        className="mt-4 rounded-pill bg-ink px-6 py-3 text-body font-bold text-white"
      >
        지도로 돌아가기
      </button>
    </div>
  );
}
