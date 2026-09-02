"use client";

/* 미저장 이탈 확인 — 파괴 액션은 비강조·좌측, 계속 쓰기가 기본 선택 (HIG·NN/g) */
export function DiscardDialog({
  open,
  title,
  onLeave,
  onStay,
}: {
  open: boolean;
  title: string;
  onLeave: () => void;
  onStay: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-70 mx-auto flex w-full max-w-app items-center justify-center px-8">
      <button
        type="button"
        aria-label="계속 쓰기"
        onClick={onStay}
        className="absolute inset-0 cursor-default bg-black/30"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative flex w-full flex-col gap-4 rounded-card-lg bg-white p-5 duration-150 animate-in fade-in-0 zoom-in-95"
      >
        <div className="flex flex-col gap-1">
          <p className="text-title font-bold text-ink">{title}</p>
          <p className="text-secondary text-gray-500">
            지금 나가면 작성한 내용이 사라져요
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onLeave}
            className="h-12 flex-1 rounded-card-lg bg-gray-050 text-body font-semibold text-gray-500"
          >
            나가기
          </button>
          <button
            type="button"
            autoFocus
            onClick={onStay}
            className="h-12 flex-1 rounded-card-lg bg-ramen text-body font-bold text-white"
          >
            계속 쓰기
          </button>
        </div>
      </div>
    </div>
  );
}
