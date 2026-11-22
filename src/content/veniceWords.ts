import rawWords from "./assets/venice-words.ko.json" with { type: "json" };
import { calculateVeniceWord, type VeniceWord } from "../domain/venice";

function isKoreanWord(value: unknown): value is string {
  return typeof value === "string" && /^[가-힣]{2,8}$/u.test(value.normalize("NFC"));
}

type WordDefinition = Readonly<{ text: string; minimumLevel?: number }>;

function readWordDefinition(value: unknown): WordDefinition | null {
  if (isKoreanWord(value)) return { text: value.normalize("NFC") };
  if (value === null || typeof value !== "object") return null;

  const definition = value as { text?: unknown; minimumLevel?: unknown };
  if (!isKoreanWord(definition.text)) return null;
  if (definition.minimumLevel === undefined) return { text: definition.text.normalize("NFC") };
  if (typeof definition.minimumLevel !== "number"
    || !Number.isInteger(definition.minimumLevel)
    || definition.minimumLevel < 1
    || definition.minimumLevel > 14) {
    return null;
  }
  return {
    text: definition.text.normalize("NFC"),
    minimumLevel: definition.minimumLevel,
  };
}

export function readVeniceWords(value: unknown): readonly VeniceWord[] {
  if (!Array.isArray(value)) return [calculateVeniceWord("바람")];
  const seen = new Set<string>();
  const words = value.flatMap((candidate) => {
    const definition = readWordDefinition(candidate);
    if (definition === null || seen.has(definition.text)) return [];
    seen.add(definition.text);
    return [{
      ...calculateVeniceWord(definition.text),
      ...(definition.minimumLevel === undefined ? {} : { minimumLevel: definition.minimumLevel }),
    }];
  });
  return words.length > 0 ? words : [calculateVeniceWord("바람")];
}

export const veniceWords = readVeniceWords(rawWords);
