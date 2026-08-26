/* 토큰 스모크 화면 — Plan 3에서 지도 홈으로 교체 */
const grays = [
  ["gray-500", "bg-gray-500"],
  ["gray-400", "bg-gray-400"],
  ["gray-300", "bg-gray-300"],
  ["gray-200", "bg-gray-200"],
  ["gray-150", "bg-gray-150"],
  ["gray-100", "bg-gray-100"],
  ["gray-050", "bg-gray-050"],
] as const;

export default function Home() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-8 p-6">
      <header className="flex items-center gap-2">
        <span className="text-heading font-extrabold tracking-tight">라맵</span>
        <span className="text-secondary text-gray-400">디자인 토큰 스모크</span>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-title font-bold">색</h2>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-card bg-accent" />
          <div className="size-10 rounded-card bg-ink" />
          <div className="size-10 rounded-card bg-open" />
          {grays.map(([name, cls]) => (
            <div key={name} className={`size-10 rounded-card ${cls}`} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-title font-bold">타이포 (굵기로 위계)</h2>
        <p className="text-display font-extrabold">display 26 완식</p>
        <p className="text-heading font-bold">heading 22 니보시</p>
        <p className="text-title font-bold">title 18 킨카</p>
        <p className="text-body">body 15 — 멸치와 정어리를 말린 니보시로 낸 육수</p>
        <p className="text-secondary text-gray-400">secondary 13 — 성수동 · 도보 6분</p>
        <p className="text-caption text-gray-300">caption 11 — 최종 확인 2026-08-26</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-title font-bold">컨트롤 = pill / 콘텐츠 = 각짐</h2>
        <div className="flex gap-2">
          <span className="rounded-full bg-ink px-3 py-2 text-secondary font-bold text-white">
            스프 · 니보시
          </span>
          <span className="rounded-full border border-gray-150 px-3 py-2 text-secondary font-semibold">
            형태
          </span>
          <span className="rounded-full bg-accent px-3.5 py-2 text-secondary font-bold text-white">
            제보하기
          </span>
        </div>
        <div className="flex items-center gap-3 rounded-card-lg bg-gray-050 p-3">
          <div className="size-12 rounded-card bg-gray-200" />
          <div className="flex flex-col">
            <span className="text-body font-bold">킨카</span>
            <span className="text-secondary text-gray-400">
              니보시 · 시오 · <span className="font-bold text-open">영업중</span>
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
