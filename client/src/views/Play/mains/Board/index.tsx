"use client";

import { useMemo, type PointerEvent } from "react";
import { boardLabel } from "@/lib/boardLabel";
import { cellFromPoint, stepDirection } from "@/lib/boardGeometry";
import { CrateSprite } from "../../components/CrateSprite";
import { GoalRings } from "../../components/GoalRings";
import { PlayerSprite } from "../../components/PlayerSprite";
import { StaticGrid } from "../../components/StaticGrid";
import { TrailDots } from "../../components/TrailDots";
import { useCrateIdentities } from "@/hooks/useCrateIdentities";
import { isGoal } from "@/game/core/rules";
import type { CellIndex, Direction, LevelState } from "@/game/core/types";

/**
 * Bàn cờ. Vẽ bằng DOM chứ không phải canvas (ADR-0002): mỗi ô là một phần tử
 * thật nên tiêu điểm, `aria`, và `prefers-reduced-motion` được cho không.
 *
 * Bố cục là năm lớp chồng lên nhau, xếp theo đúng thứ tự người chơi đọc: nền →
 * vòng đích → vệt đi → thùng → người. Chỉ hai lớp cuối di chuyển, nên một nước đi
 * chỉ động vào một hai phần tử.
 *
 * Cả khối là `role="img"` với một câu mô tả: xem `boardLabel`.
 *
 * **Bấm vào một ô kề nhân vật là đi một bước về hướng đó.** Thêm sau lượt review
 * 2026-09 (F-01): ở thiết bị có con trỏ chuột, D-pad không được vẽ, nên trước đây
 * bàn cờ là một bức ảnh câm — một người dùng đã bấm vào nó ba lần, không nhận được
 * phản hồi nào, và bỏ cuộc trước nước đi đầu tiên. Đây cố ý **không** phải tìm
 * đường tự động: một cú bấm ánh xạ 1-1 với một lần bấm phím mũi tên, nên không đẻ
 * ra luật chơi thứ hai và không bao giờ tự đẩy một thùng người chơi không định đẩy.
 */
export function Board({
  state,
  trail,
  cell,
  showTrail,
  onMove
}: {
  readonly state: LevelState;
  readonly trail: readonly CellIndex[];
  readonly cell: number;
  readonly showTrail: boolean;
  /** Bấm vào ô kề nhân vật. Không truyền thì bàn cờ chỉ để nhìn. */
  readonly onMove?: (direction: Direction) => void;
}) {
  const { board, boxes, player } = state;
  const crates = useCrateIdentities(boxes);
  const occupied = useMemo(() => new Set<CellIndex>(boxes), [boxes]);

  const handlePointer = (event: PointerEvent<HTMLDivElement>) => {
    if (!onMove) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const target = cellFromPoint(
      event.clientX - rect.left,
      event.clientY - rect.top,
      cell,
      board.width,
      board.height
    );
    if (target === null) return;
    const direction = stepDirection(player, target, board.width);
    if (direction !== null) onMove(direction);
  };

  return (
    <div
      role="img"
      aria-label={boardLabel(state)}
      data-testid="board"
      onPointerDown={onMove ? handlePointer : undefined}
      className="relative shrink-0"
      style={{
        width: board.width * cell,
        height: board.height * cell,
        borderRadius: "var(--radius-md)",
        // Cắt gọn bốn góc; bàn cờ không cuộn nên không có gì bị giấu mất.
        overflow: "hidden",
        touchAction: "none",
        cursor: onMove ? "pointer" : undefined
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
