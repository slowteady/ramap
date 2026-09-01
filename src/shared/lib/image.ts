import "client-only";

const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.82;

/* 캔버스 재인코딩 = 리사이즈 + EXIF(위치정보) 제거 */
export async function toJpegBlob(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 미지원");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("인코딩 실패"))),
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
}
