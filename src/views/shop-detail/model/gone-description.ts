import dayjs from "dayjs";

export function goneDescription(
  goneLabel: "폐업" | "이전",
  changedAt: string | null,
): string {
  const when = changedAt ? `${dayjs(changedAt).format("YYYY년 M월")}에 ` : "";
  return `${when}${goneLabel === "폐업" ? "문을 닫았어요" : "이전했어요"}. `;
}
