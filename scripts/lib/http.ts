import { execFileSync } from "node:child_process";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140 Safari/537.36";

/* Node fetch는 HTTPS_PROXY를 따르지 않아 클라우드 프록시를 못 탄다 — curl로 받는다 */
export function get(
  url: string,
  referer?: string,
): { ok: boolean; body: string; error?: string } {
  try {
    const args = [
      "-sS",
      "-L",
      "-m",
      "25",
      "-A",
      UA,
      "-w",
      "\n__HTTP__%{http_code}",
    ];
    if (referer) args.push("-H", `Referer: ${referer}`);
    const raw = execFileSync("curl", [...args, url], {
      encoding: "utf8",
      maxBuffer: 20 << 20,
    });
    const code = raw.slice(raw.lastIndexOf("__HTTP__") + 8).trim();
    const body = raw.slice(0, raw.lastIndexOf("\n__HTTP__"));
    return code === "200" && body.length > 500
      ? { ok: true, body }
      : { ok: false, body, error: `HTTP ${code}, ${body.length}B` };
  } catch (e) {
    return { ok: false, body: "", error: (e as Error).message.split("\n")[0] };
  }
}

export const sleep = (ms: number) =>
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
