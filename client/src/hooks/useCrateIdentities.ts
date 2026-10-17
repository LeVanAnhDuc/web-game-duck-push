"use client";

import { useState } from "react";
import type { CellIndex } from "@/game/core/types";

/**
 * Gắn danh tính bền cho từng thùng.
 *
 * `LevelState.boxes` **luôn được sắp tăng dần**, nên chỉ số trong mảng không phải
 * là thùng nào cả: đẩy một thùng qua chỗ của thùng khác là cả mảng đổi vị trí.
 * Lấy chỉ số mảng làm `key` của React thì thùng sẽ nhảy cóc, và hiệu ứng trượt
 * 120ms hoá ra trượt sai thùng.
 *
 * Cách khớp: thùng nào còn nguyên ô cũ thì giữ nguyên danh tính, phần còn lại
 * ghép theo thứ tự. Mỗi nước đi chỉ có tối đa một thùng đổi ô nên phép ghép này
 * luôn đúng; undo hay chơi lại đổi nhiều thùng cùng lúc thì ghép sao cũng được,
 * vì lúc đó không có chuyển động nào cần kể lại.
 */

export interface TrackedCrate {
  readonly id: number;
  readonly index: CellIndex;
}

interface Tracking {
  readonly boxes: readonly CellIndex[];
  readonly ids: readonly number[];
  readonly nextId: number;
}

function assign(boxes: readonly CellIndex[], startId: number): Tracking {
  return {
    boxes,
    ids: boxes.map((_, i) => startId + i),
    nextId: startId + boxes.length
  };
}

function reconcile(previous: Tracking, boxes: readonly CellIndex[]): Tracking {
  const usedSlots = new Set<number>();
  const slotOf = new Map<CellIndex, number>();
  previous.boxes.forEach((box, slot) => {
    if (!slotOf.has(box)) slotOf.set(box, slot);
  });

  const ids: number[] = new Array<number>(boxes.length).fill(-1);
  const unmatched: number[] = [];

  boxes.forEach((box, i) => {
    const slot = slotOf.get(box);
    if (slot !== undefined && !usedSlots.has(slot)) {
      usedSlots.add(slot);
      ids[i] = previous.ids[slot] ?? -1;
    } else {
      unmatched.push(i);
    }
  });

  const freeIds = previous.ids.filter((_, slot) => !usedSlots.has(slot));
  let nextId = previous.nextId;
  unmatched.forEach((position, k) => {
    const reused = freeIds[k];
    if (reused !== undefined) {
      ids[position] = reused;
    } else {
      ids[position] = nextId;
      nextId += 1;
    }
  });

  return { boxes, ids, nextId };
}

export function useCrateIdentities(boxes: readonly CellIndex[]): readonly TrackedCrate[] {
  const [tracking, setTracking] = useState<Tracking>(() => assign(boxes, 0));

  // Điều chỉnh state ngay trong lúc vẽ — cách React khuyến nghị để suy ra state
  // từ props mà không mất một khung hình như khi làm trong effect.
  const current = tracking.boxes === boxes ? tracking : reconcile(tracking, boxes);
  if (current !== tracking) setTracking(current);

  return current.boxes.map((index, i) => ({ id: current.ids[i] ?? i, index }));
}
