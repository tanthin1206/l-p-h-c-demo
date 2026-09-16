import { RankTier, AvatarOption } from '../types';

export const RANK_TIERS: RankTier[] = [
  {
    tier: "Sĩ Tử",
    level: 1,
    minPoints: 0,
    maxPoints: 39,
    title: "Sĩ Tử Chăm Ngoan",
    badge: "🌱",
    hatIcon: "📚",
    color: "text-[#784f2b]",
    bgColor: "bg-[#fbf7f2]",
    borderColor: "border-[#caa685]",
    cardBorderClass: "border-[#caa685] hover:border-[#b8916d]",
    description: "Học trò chăm ngoan bắt đầu chặng đường dùi mài kinh sử.",
    perks: ["Được tham gia các trò chơi khởi động lớp", "Nhận huy hiệu Sĩ Tử tài năng"]
  },
  {
    tier: "Tú Tài",
    level: 2,
    minPoints: 40,
    maxPoints: 89,
    title: "Tú Tài Chăm Chỉ",
    badge: "📜",
    hatIcon: "🎓",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    cardBorderClass: "border-blue-400 hover:border-blue-500",
    description: "Vượt qua các bài kiểm tra đầu tiên với tinh thần chuyên cần.",
    perks: ["Được quyền chọn bài hát đầu giờ", "Cộng thêm 1 lượt quay may mắn"]
  },
  {
    tier: "Cử Nhân",
    level: 3,
    minPoints: 90,
    maxPoints: 149,
    title: "Cử Nhân Xuất Sắc",
    badge: "🎖️",
    hatIcon: "🥉",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-300",
    cardBorderClass: "border-emerald-400 hover:border-emerald-500",
    description: "Đỗ kỳ thi Hương, kiến thức vững vàng và luôn năng nổ.",
    perks: ["Làm phó nhóm học tập của tổ", "Được ưu tiên phát biểu đầu tiên"]
  },
  {
    tier: "Tiến Sĩ",
    level: 4,
    minPoints: 150,
    maxPoints: 249,
    title: "Tiến Sĩ Bảng Vàng",
    badge: "⭐",
    hatIcon: "🥈",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-300",
    cardBorderClass: "border-red-400 hover:border-red-500",
    description: "Khắc tên trên bia đá Quốc Tử Giám với nhiều đóng góp cho lớp.",
    perks: ["Được làm Quản trò trong giờ sinh hoạt", "Được cấp Giấy Khen Tiến Sĩ"]
  },
  {
    tier: "Phó Bảng",
    level: 5,
    minPoints: 250,
    maxPoints: 349,
    title: "Phó Bảng Á Khoa",
    badge: "👑",
    hatIcon: "🪶",
    color: "text-[#881337]",
    bgColor: "bg-[#fff1f2]",
    borderColor: "border-[#9f1239]/60",
    cardBorderClass: "border-[#881337] hover:border-[#670e28]",
    description: "Đỗ kỳ thi Hội xuất sắc, phẩm hạnh gương mẫu.",
    perks: ["Đại diện lớp nhận cờ thi đua", "Quyền chọn vị trí ngồi yêu thích"]
  },
  {
    tier: "Trạng Nguyên",
    level: 6,
    minPoints: 350,
    maxPoints: 9999,
    title: "Trạng Nguyên Đất Việt",
    badge: "🏆",
    hatIcon: "🦅",
    color: "text-amber-900 font-black",
    bgColor: "bg-amber-100/90",
    borderColor: "border-amber-400",
    cardBorderClass: "border-2 border-amber-400 hover:border-amber-500",
    cardShadowClass: "shadow-[0_2px_14px_rgba(245,158,11,0.24)] ring-1 ring-amber-300/60",
    description: "Thủ Khoa Đất Việt - Vinh quy bái tổ, rạng rỡ lớp học!",
    perks: ["Đội Mũ Cánh Chuồn Vinh Danh", "Nhận Chiếu Chỉ Khen Thưởng Đặc Biệt", "Linh vật vinh danh Bảng Vàng"]
  }
];

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: "trau_vang", name: "Trâu Vàng Chăm Chỉ", emoji: "🐂", bg: "bg-amber-100" },
  { id: "rong_con", name: "Rồng Con Thông Minh", emoji: "🐉", bg: "bg-red-100" },
  { id: "chim_lac", name: "Chim Lạc Dũng Cảm", emoji: "🦅", bg: "bg-orange-100" },
  { id: "ca_chep", name: "Cá Chép Vượt Vũ Môn", emoji: "🐟", bg: "bg-cyan-100" },
  { id: "rua_vang", name: "Rùa Vàng Uyên Bác", emoji: "🐢", bg: "bg-emerald-100" },
  { id: "ho_con", name: "Hổ Nhỏ Mạnh Mẽ", emoji: "🐯", bg: "bg-yellow-100" },
  { id: "meo_ngoan", name: "Mèo Con Nhanh Nhẹn", emoji: "🐱", bg: "bg-pink-100" },
  { id: "chuot_thong_thai", name: "Chuột Trạng Tí", emoji: "🐭", bg: "bg-purple-100" },
  { id: "tho_ngoc", name: "Thỏ Ngọc Sáng Tạo", emoji: "🐰", bg: "bg-rose-100" },
  { id: "voi_con", name: "Voi Con Tốt Bụng", emoji: "🐘", bg: "bg-blue-100" },
  { id: "ong_vang", name: "Ong Vàng Siêng Năng", emoji: "🐝", bg: "bg-amber-100" },
  { id: "chim_hac", name: "Hạc Trắng Thanh Cao", emoji: "🦩", bg: "bg-teal-100" }
];

export function getRankByPoints(points: number): RankTier {
  const pts = typeof points === 'number' && !isNaN(points) ? Math.max(0, points) : 0;
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (pts >= RANK_TIERS[i].minPoints) {
      return RANK_TIERS[i];
    }
  }
  return RANK_TIERS[0];
}

export function getNextRank(currentTier: string): RankTier | null {
  const currentIndex = RANK_TIERS.findIndex(r => r.tier === currentTier);
  if (currentIndex >= 0 && currentIndex < RANK_TIERS.length - 1) {
    return RANK_TIERS[currentIndex + 1];
  }
  return null;
}

export function calcRankProgress(points: number) {
  const currentRank = getRankByPoints(points);
  const nextRank = getNextRank(currentRank.tier);

  if (!nextRank) {
    return {
      progressPercent: 100,
      pointsNeeded: 0,
      currentRank,
      nextRank: null
    };
  }

  const range = nextRank.minPoints - currentRank.minPoints;
  const currentProgress = points - currentRank.minPoints;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentProgress / range) * 100)));
  const pointsNeeded = Math.max(0, nextRank.minPoints - points);

  return {
    progressPercent,
    pointsNeeded,
    currentRank,
    nextRank
  };
}
