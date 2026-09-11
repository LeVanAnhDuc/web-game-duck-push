"use client";

import { useMemo } from "react";
import { boardLabel } from "@/lib/boardLabel";
import { CrateSprite } from "../../components/CrateSprite";
import { GoalRings } from "../../components/GoalRings";
import { PlayerSprite } from "../../components/PlayerSprite";
import { StaticGrid } from "../../components/StaticGrid";
import { TrailDots } from "../../components/TrailDots";
import { useCrateIdentities } from "@/hooks/useCrateIdentities";
import { isGoal } from "@/game/core/rules";
import type { CellIndex, LevelState } from "@/game/core/types";

/**
 * Bàn cờ. Vẽ bằng DOM chứ không phải canvas (ADR-0002): mỗi ô là một phần tử
 * thật nên tiêu điểm, `aria`, và `prefers-reduced-motion` được cho không.
 *
 * Bố cục là năm lớp chồng lên nhau, xếp theo đúng thứ tự người chơi đọc: nền →
 * vòng đích → vệt đi → thùng → người. Chỉ hai lớp cuối di chuyển, nên một nước đi
 * chỉ động vào một hai phần tử.
 *
 * Cả khối là `role="img"` với một câu tóm tắt: trình đọc màn hình cần biết còn
 * mấy thùng chưa vào đích, không cần nghe đọc 144 ô.
 */
export function Board({
  state,
  trail,
  cell,
  showTrail
}: {
  readonly state: LevelState;
  readonly trail: readonly CellIndex[];
  readonly cell: number;
  readonly showTrail: boolean;
}) {
  const { board, boxes, player } = state;
  const crates = useCrateIdentities(boxes);
  const occupied = useMemo(() => new Set<CellIndex>(boxes), [boxes]);

  return (
    <div
      role="img"
      aria-label={boardLabel(state)}
      data-testid="board"
      className="relative shrink-0"
      style={{
        width: board.width * cell,
        height: board.height * cell,
        borderRadius: "var(--radius-md)",
        // Cắt gọn bốn góc; bàn cờ không cuộn nên không có gì bị giấu mất.
        overflow: "hidden",
        touchAction: "none"
      }}
    >
      <StaticGrid board={board} cell={cell} />
      <GoalRings board={board} cell={cell} occupied={occupied} />
      {showTrail ? <TrailDots trail={trail} boardWidth={board.width} cell={cell} /> : null}
      {crates.map((crate) => (
        <CrateSprite
          key={crate.id}
          index={crate.index}
          boardWidth={board.width}
          cell={cell}
          onGoal={isGoal(board, crate.index)}
        />
      ))}
      <PlayerSprite index={player} boardWidth={board.width} cell={cell} />
    </div>
  );
}
