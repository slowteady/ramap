"use client";

import { useCallback, useState } from "react";
import {
  buildEditPayload,
  buildNewPayload,
  canSubmitEdit,
  canSubmitNew,
  EMPTY_EDIT_DRAFT,
  EMPTY_NEW_DRAFT,
  toReportRow,
  type EditItem,
  type EditReportDraft,
  type NewReportDraft,
  type ReportTarget,
} from "./report-payload";
import { toggleSlug } from "./report-options";
import { useReportSubmit } from "./use-report-submit";

type ListKey<D> = {
  [K in keyof D]: D[K] extends string[] ? K : never;
}[keyof D];

function useDraft<D extends object>(initial: D) {
  const [draft, setDraft] = useState(initial);
  const set = useCallback(
    <K extends keyof D>(key: K, value: D[K]) =>
      setDraft((d) => ({ ...d, [key]: value })),
    [],
  );
  const toggle = useCallback(
    <K extends ListKey<D>>(key: K, slug: string) =>
      setDraft((d) => ({
        ...d,
        [key]: toggleSlug(d[key] as string[], slug),
      })),
    [],
  );
  return { draft, set, toggle };
}

export function useNewReportForm() {
  const { draft, set, toggle } = useDraft<NewReportDraft>(EMPTY_NEW_DRAFT);
  const { phase, submit } = useReportSubmit();
  const canSubmit = phase === "editing" && canSubmitNew(draft);

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    void submit(toReportRow(buildNewPayload(draft)));
  }, [canSubmit, submit, draft]);

  return { draft, set, toggle, phase, canSubmit, submit: handleSubmit };
}

export function useEditReportForm(target: ReportTarget) {
  const { draft, set, toggle } = useDraft<EditReportDraft>(EMPTY_EDIT_DRAFT);
  const { phase, submit } = useReportSubmit();
  const canSubmit = phase === "editing" && canSubmitEdit(draft);

  const toggleItem = useCallback(
    (item: EditItem) => toggle("items", item),
    [toggle],
  );
  const has = useCallback(
    (item: EditItem) => draft.items.includes(item),
    [draft.items],
  );

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    void submit(toReportRow(buildEditPayload(target, draft), target));
  }, [canSubmit, submit, target, draft]);

  return {
    draft,
    set,
    toggle,
    toggleItem,
    has,
    phase,
    canSubmit,
    submit: handleSubmit,
  };
}
