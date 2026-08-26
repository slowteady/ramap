export function buildSdkUrl(key: string): string {
  return `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false`;
}

let pending: Promise<void> | null = null;

export function resetKakaoSdkForTest(): void {
  pending = null;
}

export function loadKakaoSdk(key: string | undefined): Promise<void> {
  if (!key) return Promise.reject(new Error("카카오맵 키 없음"));
  if (pending) return pending;

  pending = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = buildSdkUrl(key);
    script.async = true;
    script.dataset.kakaoSdk = "true";
    script.onload = () => {
      window.kakao.maps.load(() => resolve());
    };
    script.onerror = () => {
      pending = null;
      reject(new Error("카카오맵 SDK 로드 실패"));
    };
    document.head.appendChild(script);
  });
  return pending;
}
