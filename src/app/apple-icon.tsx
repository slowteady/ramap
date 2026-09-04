import { ImageResponse } from "next/og";
import { LOGO_DATA_URI } from "@/shared/lib/logo";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#e23c36",
      }}
    >
      <img src={LOGO_DATA_URI} width={180} height={180} alt="" />
    </div>,
    size,
  );
}
