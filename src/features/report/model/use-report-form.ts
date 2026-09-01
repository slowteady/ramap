"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { uploadReportPhotos } from "./photo-upload";
import {
  buildEditPayload,
  buildNewPayload,
  canSubmitEdit,
  canSubmitNew,
  EMPTY_EDIT_DRAFT,
  EMPTY_NEW_DRAFT,
  isLikelyUrl,
  MAX_LINKS,
  MAX_PHOTOS,
  toReportRow,
  type EditItem,
  type EditReportDraft,
  type LatLng,
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
  return { draft, setDraft, set, toggle };
}

export function useNewReportForm(mapCenter: LatLng | null) {
  const { draft, setDraft, set } = useDraft<NewReportDraft>(EMPTY_NEW_DRAFT);
  const { phase, submit } = useReportSubmit();
  const canSubmit = phase === "editing" && canSubmitNew(draft);

  const setLink = useCallback(
    (index: number, value: string) =>
      setDraft((d) => ({
        ...d,
        links: d.links.map((l, i) => (i === index ? value : l)),
      })),
    [setDraft],
  );
  const addLink = useCallback(
    () =>
      setDraft((d) =>
        d.links.length >= MAX_LINKS ? d : { ...d, links: [...d.links, ""] },
      ),
    [setDraft],
  );
  const removeLink = useCallback(
    (index: number) =>
      setDraft((d) => ({ ...d, links: d.links.filter((_, i) => i !== index) })),
    [setDraft],
  );

  const addPhotos = useCallback(
    (files: File[]) =>
      setDraft((d) => ({
        ...d,
        photos: [...d.photos, ...files].slice(0, MAX_PHOTOS),
      })),
    [setDraft],
  );
  const removePhoto = useCallback(
    (index: number) =>
      setDraft((d) => ({
        ...d,
        photos: d.photos.filter((_, i) => i !== index),
      })),
    [setDraft],
  );

  const togglePin = useCallback(
    () => setDraft((d) => ({ ...d, pin: d.pin ? null : mapCenter })),
    [setDraft, mapCenter],
  );

  const [touchedLinks, setTouchedLinks] = useState<number[]>([]);
  const touchLink = useCallback(
    (index: number) =>
      setTouchedLinks((t) => (t.includes(index) ? t : [...t, index])),
    [],
  );
  const linkError = useCallback(
    (index: number) => {
      const value = draft.links[index]?.trim() ?? "";
      return touchedLinks.includes(index) && value !== "" && !isLikelyUrl(value)
        ? "링크 형식이 아니에요. 주소창의 URL을 붙여넣어 주세요."
        : null;
    },
    [draft.links, touchedLinks],
  );

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    void submit(async () => {
      let paths: string[] = [];
      if (draft.photos.length > 0) {
        const uploaded = await uploadReportPhotos(draft.photos, "new");
        if (!uploaded) {
          toast("사진 업로드에 실패했어요. 사진을 빼거나 다시 시도해 주세요.");
          return null;
        }
        paths = uploaded;
      }
      return toReportRow(buildNewPayload(draft, paths));
    });
  }, [canSubmit, submit, draft]);

  return {
    draft,
    set,
    setLink,
    addLink,
    removeLink,
    addPhotos,
    removePhoto,
    togglePin,
    touchLink,
    linkError,
    canAttachPin: mapCenter !== null,
    phase,
    canSubmit,
    submit: handleSubmit,
  };
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
    void submit(async () =>
      toReportRow(buildEditPayload(target, draft), target),
    );
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
