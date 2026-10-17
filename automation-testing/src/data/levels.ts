import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseXsb, type Parsed } from "@/utils/sokoban";

// The committed level packs of the app (../client/src/game/levels/data/<difficulty>.json) are DATA, already verified by
// the app's own pack suite (invariant #17). The tests read them as data - which level is easy-01 and what its board is -
// and never import the game's code.
export type Difficulty = "easy" | "medium" | "hard" | "expert";

export interface PackLevel {
  readonly id: string;
  readonly seed: number;
  readonly difficulty: Difficulty;
  readonly xsb: readonly string[];
  readonly optimalPushes: number;
  readonly optimalMoves: number;
}

const PACK_DIR = join(__dirname, "..", "..", "..", "client", "src", "game", "levels", "data");

export function pack(difficulty: Difficulty): readonly PackLevel[] {
  const raw = JSON.parse(readFileSync(join(PACK_DIR, `${difficulty}.json`), "utf8")) as { levels: PackLevel[] };
  return raw.levels;
}

export function packLevel(id: string): PackLevel & Parsed {
  const difficulty = id.split("-")[0] as Difficulty;
  const level = pack(difficulty).find((l) => l.id === id);
  if (!level) throw new Error(`no level ${id} in the ${difficulty} pack`);
  return { ...level, ...parseXsb(level.xsb) };
}
