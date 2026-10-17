// Text the tests assert on, copied verbatim with its source path (relative to ../client/src), so a copy change is fixed
// here, not in specs. The game has no locale files: every string lives next to its component (NFR-I18N-01 groups them
// per component, not in one file).

export const copy = {
  home: {
    // app/layout.tsx → metadata.title
    tabTitle: "Duck Push",
    // views/Home/index.tsx
    title: "DUCK PUSH",
    campaign: "Chiến dịch",
    difficultyGroup: "Bậc khó",
    // views/Home/mains/CampaignGrid/index.tsx → Legend
    legendSolved: "đã giải",
    legendOptimal: "đạt đúng số đẩy tối ưu",
    // views/Home/mains/ResumeCard/index.tsx
    resumeHeading: "Đang chơi dở",
    resumeAction: "Chơi tiếp",
  },
  // lib/levelText.ts → DIFFICULTY_LABELS
  difficulty: { easy: "Dễ", medium: "Vừa", hard: "Khó", expert: "Rất khó" },
  random: {
    // views/Home/components/RandomLevelButton/index.tsx
    button: (tier: string) => `Màn ngẫu nhiên · ${tier}`,
    pending: "Đang sinh màn…",
    // lib/levelText.ts → levelTitle / levelSubtitle
    title: "Màn ngẫu nhiên",
    subtitle: (tier: string, seed: number) => `${tier} · Seed ${seed}`,
  },
  // hooks/levelRouting.ts → parseBootTarget
  notice: {
    badSeed: "Seed trong đường dẫn không đọc được nên mình mở trang chủ.",
    badDifficulty: "Đường dẫn thiếu bậc khó hợp lệ nên mình mở trang chủ.",
    // hooks/useLevelRouter.ts → openCampaignLevel / resolveBootTarget
    unknownLevel: (id: string) => `Không mở được màn ${id}`,
  },
  play: {
    // views/Play/mains/BackBar/index.tsx
    back: "Về trang chủ",
    campaignSubtitle: (tier: string) => `${tier} · Chiến dịch`,
    levelTitle: (n: number) => `Màn ${n}`,
    // views/Play/components/HudStrip/index.tsx
    targets: (optimal: number, record: string) => `Tối ưu ${optimal} đẩy · KL bạn ${record}`,
    noRecord: "chưa có",
    // views/Play/components/Controls/index.tsx
    undo: "Hoàn tác",
    redo: "Làm lại",
    restart: "Chơi lại",
    result: "Kết quả",
    keyHint: "Bấm vào ô cạnh nhân vật, hoặc dùng phím ← ↑ → ↓ · Z hoàn tác · R chơi lại",
    // views/Play/components/DPad/index.tsx
    dpad: { up: "Đi lên", left: "Sang trái", right: "Sang phải", down: "Đi xuống" },
    // views/Play/components/DeadlockBanner/index.tsx
    stuckOne: "Thùng này kẹt rồi — hoàn tác?",
    stuckMany: (n: number) => `${n} thùng kẹt rồi — hoàn tác?`,
    // views/Play/index.tsx → live region
    announceWin: (moves: number, pushes: number) => `Xong màn với ${moves} bước và ${pushes} lần đẩy.`,
    announceStuck: "Cảnh báo: có thùng bị kẹt, nên hoàn tác.",
  },
  win: {
    // views/Play/components/WinOverlay/index.tsx
    title: "Xong màn!",
    stats: (moves: number, pushes: number) => `${moves} bước · ${pushes} đẩy`,
    optimal: (optimal: number) => `Đạt đúng số đẩy tối ưu (${optimal} đẩy).`,
    notOptimal: (optimal: number, extra: number) => `Tối ưu là ${optimal} đẩy — còn ${extra} đẩy nữa là chạm đáy.`,
    firstTime: "Lần đầu bạn giải màn này.",
    oldRecord: (pushes: number) => `Kỷ lục cũ: ${pushes} đẩy.`,
    beaten: (pushes: number) => `Kỷ lục cũ: ${pushes} đẩy — vừa bị bạn phá.`,
    restart: "Chơi lại",
    next: "Tiếp",
    random: "Màn ngẫu nhiên",
  },
  theme: {
    // hooks/useTheme.ts → THEME_LABELS; views/Home/components/ThemeToggle/index.tsx → aria-label
    system: "Theo hệ thống",
    light: "Nền sáng",
    dark: "Nền tối",
    toggle: (label: string) => `Giao diện: ${label}. Bấm để đổi.`,
  },
  ducker: {
    // views/Home/components/AccountButton/index.tsx → STRINGS
    signIn: "Đăng nhập",
    signingIn: "Đang đăng nhập…",
    menu: "Tài khoản Ducker ID",
    openProfile: "Mở hồ sơ Ducker ID",
    signOut: "Đăng xuất",
  },
} as const;

export const serverMessage = {} as const;
