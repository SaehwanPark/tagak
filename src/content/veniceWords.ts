import rawWords from "./assets/venice-words.ko.json" with { type: "json" };
import { calculateVeniceWord, type VeniceWord } from "../domain/venice";

function isKoreanWord(value: unknown): value is string {
  return typeof value === "string" && /^[가-힣]{2,8}$/u.test(value.normalize("NFC"));
}

function readWords(value: unknown): readonly VeniceWord[] {
  if (!Array.isArray(value)) return [calculateVeniceWord("바람")];
  const seen = new Set<string>();
  const words = value.flatMap((candidate) => {
    if (!isKoreanWord(candidate)) return [];
    const normalized = candidate.normalize("NFC");
    if (seen.has(normalized)) return [];
    seen.add(normalized);
    return [calculateVeniceWord(normalized)];
  });
  return words.length > 0 ? words : [calculateVeniceWord("바람")];
}

export const veniceWords = readWords(rawWords);
