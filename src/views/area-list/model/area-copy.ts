import { josa } from "es-hangul";

export function faqAnswer(description: string): string {
  return josa(description, "이에요/예요");
}
