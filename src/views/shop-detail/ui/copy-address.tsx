"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

export function CopyAddress({ address }: { address: string }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      toast("주소를 복사했어요");
    } catch {
      toast("복사에 실패했어요. 길게 눌러 복사해 주세요.");
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="-my-2 flex h-11 shrink-0 items-center gap-1 px-2 text-secondary font-semibold text-gray-500"
    >
      <Copy className="size-3.5" />
      복사
    </button>
  );
}
