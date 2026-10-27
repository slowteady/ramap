import { toast } from "sonner";

const UNDO_TOAST_MS = 10_000;

export function toastWithUndo(message: string, onUndo: () => void) {
  toast(message, {
    duration: UNDO_TOAST_MS,
    action: { label: "되돌리기", onClick: onUndo },
  });
}
