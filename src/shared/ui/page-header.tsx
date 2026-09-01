import { BackButton } from "./back-button";

/* 2뎁스 공통 헤더 — 뒤로가기 + 우측 보조 액션 1개 (로고·홈 링크 없음) */
export function PageHeader({
  action,
  dark = false,
}: {
  action?: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <header className="flex items-center justify-between px-2 py-2">
      <BackButton className={dark ? "text-white" : undefined} />
      {action && <div className="pr-2">{action}</div>}
    </header>
  );
}
