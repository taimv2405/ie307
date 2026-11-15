export type HomeStats = {
  /** Số thẻ đến hạn ôn hôm nay. */
  dueCount: number;
  /** Tổng số thẻ trong bộ sưu tập. */
  totalCards: number;
};

// MOCK: số liệu giả để dựng giao diện. Khi có kho thẻ thật, chỉ cần thay phần
// thân hook này (đọc từ SQLite/API); màn hình không phải sửa gì.
const MOCK_HOME_STATS: HomeStats = { dueCount: 12, totalCards: 148 };

export function useHomeStats(): HomeStats {
  return MOCK_HOME_STATS;
}
