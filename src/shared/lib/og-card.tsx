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

export async function ogCard({ photo = null }: { photo?: string | null }) {
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
      OG_SIZE,
    );
  }

  /* fallback — 중앙 로고만. 매장 정보는 카드 아래 og:title·description 몫 */
  const extraBold = await readFile(join(FONT_DIR, "Pretendard-ExtraBold.otf"));
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 36,
        background: "#ffffff",
        fontFamily: "Pretendard",
      }}
    >
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: 44,
          border: `27px solid ${RAMEN}`,
          background: "#ffffff",
        }}
      />
      <div
        style={{
          fontSize: 132,
          fontWeight: 800,
          color: RAMEN,
          letterSpacing: "-0.02em",
        }}
      >
        라맵
      </div>
    </div>,
    {
      ...OG_SIZE,
      fonts: [{ name: "Pretendard", data: extraBold, weight: 800 }],
    },
  );
}
