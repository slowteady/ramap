"use client";

import { useEffect, useMemo } from "react";
import { Plus, X } from "lucide-react";

export function PhotoPicker({
  files,
  max,
  onAdd,
  onRemove,
}: {
  files: File[];
  max: number;
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
}) {
  const urls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(
    () => () => {
      for (const url of urls) URL.revokeObjectURL(url);
    },
    [urls],
  );

  return (
    <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
      {files.length < max && (
        <label className="flex size-20 shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-card border border-dashed border-gray-200 bg-white text-gray-400">
          <Plus className="size-5" />
          <span className="text-caption font-semibold">
            {files.length}/{max}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              /* FileList는 live — value 초기화 전에 복사해야 지연 실행되는 상태 업데이터가 빈 목록을 받지 않는다 */
              const picked = Array.from(e.target.files ?? []);
              e.target.value = "";
              if (picked.length > 0) onAdd(picked);
            }}
          />
        </label>
      )}
      {urls.map((url, i) => (
        <div key={url} className="relative size-20 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            className="size-full rounded-card object-cover"
          />
          <button
            type="button"
            aria-label="사진 삭제"
            onClick={() => onRemove(i)}
            className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-pill bg-ink/70 text-white"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
