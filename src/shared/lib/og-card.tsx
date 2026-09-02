import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

const FONT_DIR = join(
  process.cwd(),
  "node_modules/pretendard/dist/public/static",
);

/* 토큰 원시값 — globals.css @theme와 동기 (satori는 CSS 변수 미지원) */
const RAMEN = "#e23c36";
const INK = "#1a1b1f";
const GRAY = "#6b6e76";

export async function ogCard({
  title,
  subline,
  photo = null,
}: {
  title: string;
  subline: string | null;
  photo?: string | null;
}) {
  const [extraBold, semiBold] = await Promise.all([
    readFile(join(FONT_DIR, "Pretendard-ExtraBold.otf")),
    readFile(join(FONT_DIR, "Pretendard-SemiBold.otf")),
  ]);
  const fonts = [
    { name: "Pretendard", data: extraBold, weight: 800 as const },
    { name: "Pretendard", data: semiBold, weight: 600 as const },
  ];

  /* 사진 카드 — 가로 크롭 풀블리드, 합성 요소 없음 (네이버플레이스 문법. jpeg/png만 렌더됨 — webp 불가) */
  if (photo) {
    return new ImageResponse(
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        <img
          src={photo}
          width={1200}
          height={630}
          style={{ objectFit: "cover" }}
        />
      </div>,
      { ...OG_SIZE, fonts },
    );
  }

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#ffffff",
        padding: "72px 80px",
        fontFamily: "Pretendard",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          fontSize: 44,
          fontWeight: 800,
          color: RAMEN,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            border: `11px solid ${RAMEN}`,
            background: "#ffffff",
          }}
        />
        라맵
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div
          style={{
            fontSize: title.length > 14 ? 72 : 88,
            fontWeight: 800,
            color: INK,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            wordBreak: "keep-all",
          }}
        >
          {title}
        </div>
        {subline && (
          <div style={{ fontSize: 38, fontWeight: 600, color: GRAY }}>
            {subline}
          </div>
        )}
      </div>
      <div style={{ fontSize: 30, fontWeight: 600, color: GRAY }}>
        한국 라멘을 장르로 찾는 지도 — ramap.kr
      </div>
    </div>,
    { ...OG_SIZE, fonts },
  );
}
