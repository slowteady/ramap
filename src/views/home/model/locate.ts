const PERMISSION_DENIED = 1;

export function locateFailureMessage(code: number | null): string {
  if (code === null) return "이 브라우저에서는 내 위치를 찾을 수 없어요";
  if (code === PERMISSION_DENIED)
    return "위치 접근을 허용하면 내 주변 라멘집을 볼 수 있어요";
  return "내 위치를 찾지 못했어요. 잠시 뒤에 다시 눌러 주세요";
}
