import React, { useState } from 'react';
import { 
  Trophy, 
  Users, 
  Gift, 
  Sparkles, 
  Flame, 
  Star, 
  Plus, 
  Minus, 
  X,
  Award,
  Edit2,
  Trash2,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Group, Student, Criterion, PointLog } from '../../types';
import { soundEngine } from '../../utils/soundEngine';
import { storage } from '../../utils/storage';
import { AVATAR_OPTIONS, getRankByPoints } from '../../utils/ranks';
import { getAssetUrl } from '../../utils/assets';

const ICON_SUGGESTIONS = ['🐉', '🐯', '🦅', '🐟', '🦁', '🐢', '🦄', '🕊️', '🦊', '🐼', '🐬', '🦚', '🌟', '🌸', '🎋', '⚡'];

const COLOR_PRESETS = [
  { name: 'Vàng Rồng', class: 'from-amber-500 to-orange-600', preview: 'bg-gradient-to-r from-amber-500 to-orange-600' },
  { name: 'Đỏ Hổ', class: 'from-red-500 to-rose-600', preview: 'bg-gradient-to-r from-red-500 to-rose-600' },
  { name: 'Xanh Chim Lạc', class: 'from-emerald-500 to-teal-600', preview: 'bg-gradient-to-r from-emerald-500 to-teal-600' },
  { name: 'Lam Cá Chép', class: 'from-blue-500 to-indigo-600', preview: 'bg-gradient-to-r from-blue-500 to-indigo-600' },
  { name: 'Tím Phượng Hoàng', class: 'from-purple-500 to-pink-600', preview: 'bg-gradient-to-r from-purple-500 to-pink-600' },
  { name: 'Cam Sư Tử', class: 'from-orange-500 to-amber-600', preview: 'bg-gradient-to-r from-orange-500 to-amber-600' },
];

interface GroupsViewProps {
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  criteria: Criterion[];
  pointLogs: PointLog[];
  setPointLogs: React.Dispatch<React.SetStateAction<PointLog[]>>;
}

export const GroupsView: React.FC<GroupsViewProps> = ({
  groups,
  setGroups,
  students,
  setStudents,
  criteria,
  pointLogs,
  setPointLogs
}) => {
  const [awardGroupModal, setAwardGroupModal] = useState<Group | null>(null);

  // Modal State: Thêm / Sửa Tổ
  const [groupModalState, setGroupModalState] = useState<{
    isOpen: boolean;
    group: Group | null;
  }>({ isOpen: false, group: null });

  const [groupFormData, setGroupFormData] = useState<{
    name: string;
    slogan: string;
    icon: string;
    color: string;
  }>({
    name: '',
    slogan: '',
    icon: '🐉',
    color: 'from-amber-500 to-orange-600'
  });

  const handleOpenAddGroup = () => {
    const nextNum = groups.length + 1;
    setGroupFormData({
      name: `Tổ ${nextNum}: `,
      slogan: 'Đoàn kết - Chăm ngoan - Tiến bộ',
      icon: ICON_SUGGESTIONS[(nextNum - 1) % ICON_SUGGESTIONS.length],
      color: COLOR_PRESETS[(nextNum - 1) % COLOR_PRESETS.length].class
    });
    setGroupModalState({ isOpen: true, group: null });
  };

  const handleOpenEditGroup = (g: Group) => {
    setGroupFormData({
      name: g.name,
      slogan: g.slogan || '',
      icon: g.icon || '🐉',
      color: g.color || 'from-amber-500 to-orange-600'
    });
    setGroupModalState({ isOpen: true, group: g });
  };

  const handleSaveGroupModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupFormData.name.trim()) {
      alert('Vui lòng nhập tên tổ thi đua!');
      return;
    }

    if (groupModalState.group) {
      // Edit existing group
      const updated = groups.map(g => g.id === groupModalState.group!.id ? {
        ...g,
        name: groupFormData.name.trim(),
        slogan: groupFormData.slogan.trim(),
        icon: groupFormData.icon.trim() || '🐉',
        color: groupFormData.color
      } : g);
      setGroups(updated);
      storage.saveGroups(updated);
      soundEngine.playPointGain();
    } else {
      // Create new group
      const newGroup: Group = {
        id: `group-${Date.now()}`,
        name: groupFormData.name.trim(),
        slogan: groupFormData.slogan.trim() || 'Đoàn kết cùng tiến bộ',
        icon: groupFormData.icon.trim() || '🐉',
        color: groupFormData.color
      };
      const updated = [...groups, newGroup];
      setGroups(updated);
      storage.saveGroups(updated);
      soundEngine.playFestiveDrum();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    setGroupModalState({ isOpen: false, group: null });
  };

  const handleDeleteGroup = (groupToDelete: Group) => {
    if (groups.length <= 1) {
      alert('Lớp học phải có ít nhất 1 tổ thi đua! Không thể xóa hết tổ.');
      return;
    }

    const memberCount = students.filter(s => s.groupId === groupToDelete.id).length;
    const confirmMsg = memberCount > 0
      ? `Thầy/Cô có chắc chắn muốn xóa "${groupToDelete.name}"?\n\nHiện có ${memberCount} học sinh trong tổ này. Các học sinh sẽ được tự động chuyển sang tổ khác để không bị mất dữ liệu!`
      : `Thầy/Cô có chắc chắn muốn xóa "${groupToDelete.name}" khỏi danh sách các tổ thi đua?`;

    if (!window.confirm(confirmMsg)) return;

    const remainingGroups = groups.filter(g => g.id !== groupToDelete.id);
    const fallbackGroup = remainingGroups[0];

    // Re-assign members safely
    const updatedStudents = students.map(s => {
      if (s.groupId === groupToDelete.id) {
        return { ...s, groupId: fallbackGroup.id };
      }
      return s;
    });

    setStudents(updatedStudents);
    storage.saveStudents(updatedStudents);

    setGroups(remainingGroups);
    storage.saveGroups(remainingGroups);

    soundEngine.playPointDeduct();
  };

  // Thưởng điểm cả tổ
  const handleAwardGroup = (group: Group, criterion: Criterion) => {
    soundEngine.playFestiveDrum();
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });

    const newLogs: PointLog[] = [];
    const updatedStudents = students.map(s => {
      if (s.groupId === group.id) {
        const newPoints = Math.max(0, s.points + criterion.points);
        const newStars = Math.floor(newPoints / 10);
        newLogs.push({
          id: `log-${Date.now()}-${s.id}`,
          studentId: s.id,
          criterionId: criterion.id,
          criterionName: `${criterion.name} (${group.name})`,
          points: criterion.points,
          timestamp: new Date().toISOString()
        });
        return { ...s, points: newPoints, stars: newStars };
      }
      return s;
    });

    setStudents(updatedStudents);
    storage.saveStudents(updatedStudents);

    const updatedLogs = [...newLogs, ...pointLogs];
    setPointLogs(updatedLogs);
    storage.savePointLogs(updatedLogs);

    setAwardGroupModal(null);
  };

  // Group statistics
  const groupStats = groups.map(g => {
    const members = students.filter(s => s.groupId === g.id);
    const totalPoints = members.reduce((sum, s) => sum + s.points, 0);
    const avgPoints = members.length > 0 ? Math.round((totalPoints / members.length) * 10) / 10 : 0;
    const leader = members.find(m => m.role.includes('Tổ trưởng') || m.role.includes('phó') || m.role.includes('trưởng')) || members[0];

    return {
      group: g,
      members,
      totalPoints,
      avgPoints,
      leader
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints);

  const getGroupMascotImage = (id: string, name: string) => {
    if (id === 'group-1' || name.includes('Rồng')) return getAssetUrl('/assets/images/to-1-rong-vang.jpg');
    if (id === 'group-2' || name.includes('Hổ')) return getAssetUrl('/assets/images/to-2-ho-dung-manh.jpg');
    if (id === 'group-3' || name.includes('Lạc')) return getAssetUrl('/assets/images/to-3-chim-lac.jpg');
    if (id === 'group-4' || name.includes('Cá Chép')) return getAssetUrl('/assets/images/to-4-ca-chep.jpg');
    return getAssetUrl('/assets/images/trang-ti.jpg');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Group Competition Header */}
      <div className="bg-gradient-to-r from-amber-700 via-yellow-700 to-amber-800 rounded-3xl p-6 sm:p-8 text-amber-50 shadow-xl border-4 border-amber-400 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-950/70 border border-amber-400 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>BẢNG XẾP HẠNG THI ĐUA CÁC TỔ</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black font-brand text-yellow-300 mb-2">
            Đoàn Kết Cùng Tiến Bộ
          </h2>
          <p className="text-sm font-serif italic text-amber-200">
            « Thi đua học tốt - rèn nghiêm - kiến tạo tập thể vững mạnh »
          </p>
        </div>
      </div>

      {/* Action Bar: Manage & Add Group */}
      <div className="bg-white rounded-2xl p-3.5 sm:px-5 shadow-xs border border-amber-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
            <Users className="w-5 h-5 text-amber-800" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Quản Lý Các Tổ Thi Đua</h3>
            <p className="text-xs text-slate-500">Lớp hiện có <span className="font-bold text-amber-800">{groups.length} tổ</span> thi đua</p>
          </div>
        </div>

        <button
          id="btn-add-new-group"
          type="button"
          onClick={handleOpenAddGroup}
          className="px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md border border-amber-500 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4 text-yellow-200" />
          <span>Thêm Tổ Mới</span>
        </button>
      </div>

      {/* Empty State Banner if no students */}
      {students.length === 0 && (
        <div className="bg-amber-50 rounded-3xl p-6 border-2 border-dashed border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img 
              src={getAssetUrl("/assets/images/trang-ti.jpg")} 
              alt="Trạng Tí" 
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
            />
            <div>
              <h4 className="font-black text-slate-800 text-base">Chưa có môn sinh nào được phân tổ</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Các tổ hiện chưa có thành viên. Thầy/Cô có thể nạp nhanh 32 học sinh mẫu hoặc thêm học sinh để theo dõi thi đua giữa 4 tổ!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const samples = storage.loadSampleStudents();
              setStudents(samples);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-bold text-xs rounded-xl shadow-md whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Nạp 32 học sinh mẫu</span>
          </button>
        </div>
      )}

      {/* 4 Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groupStats.map((stat, rankIdx) => {
          const { group, members, totalPoints, avgPoints, leader } = stat;
          const isFirst = rankIdx === 0;
          const mascotImg = getGroupMascotImage(group.id, group.name);

          return (
            <div
              key={group.id}
              className={`bg-white rounded-3xl p-6 shadow-md border-2 transition-all hover:shadow-xl relative flex flex-col justify-between ${
                isFirst ? 'border-yellow-400 ring-2 ring-yellow-300/50 shadow-yellow-100' : 'border-amber-200'
              }`}
            >
              {/* Rank Tag & Mascot */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src={mascotImg} 
                      alt={group.name} 
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-sm"
                    />
                    <span className="absolute -bottom-1 -right-1 text-sm bg-white rounded-full px-1 shadow border border-amber-200">
                      {group.icon}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-lg sm:text-xl text-slate-800 truncate">{group.name}</h3>
                    <p className="text-xs text-amber-700 font-medium italic truncate">"{group.slogan}"</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  <div className="flex items-center gap-1 font-black text-xs sm:text-sm px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300">
                    {isFirst ? '🥇 Hạng 1' : rankIdx === 1 ? '🥈 Hạng 2' : rankIdx === 2 ? '🥉 Hạng 3' : `Hạng ${rankIdx + 1}`}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEditGroup(group)}
                    className="p-1.5 text-slate-400 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                    title="Chỉnh sửa tổ này"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteGroup(group)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Xóa bớt tổ này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Group Quick Stats */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 text-center mb-4">
                <div>
                  <div className="text-[10px] text-amber-800 uppercase font-semibold">Tổng Điểm</div>
                  <div className="text-xl font-black text-amber-950 flex items-center justify-center gap-1 mt-0.5">
                    <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                    {totalPoints}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-amber-800 uppercase font-semibold">Bình Quân</div>
                  <div className="text-xl font-black text-amber-800 mt-0.5">
                    {avgPoints}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-amber-800 uppercase font-semibold">Thành Viên</div>
                  <div className="text-xl font-black text-slate-700 mt-0.5">
                    {members.length} em
                  </div>
                </div>
              </div>

              {/* Leader info */}
              {leader && (
                <div className="text-xs text-slate-600 mb-3 flex items-center gap-1.5">
                  <span className="font-bold text-slate-700">Đại diện phụ trách:</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 font-medium text-slate-800">
                    {leader.name} ({leader.role})
                  </span>
                </div>
              )}

              {/* Members List */}
              <div className="space-y-1.5 mb-5 max-h-48 overflow-y-auto pr-1">
                {members.map(m => {
                  const av = AVATAR_OPTIONS.find(a => a.id === m.avatar) || AVATAR_OPTIONS[0];
                  const r = getRankByPoints(m.points);
                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-amber-50/50 border border-slate-100 text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span>{av.emoji}</span>
                        <span className="font-bold text-slate-800 truncate">{m.name}</span>
                        <span className="text-[10px] text-slate-400">({m.role})</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-semibold text-slate-500">{r.tier}</span>
                        <span className="font-black text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded-lg">
                          🌸 {m.points}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action: Award group */}
              <button
                onClick={() => setAwardGroupModal(group)}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-amber-950 font-bold rounded-xl shadow-md border border-amber-400 flex items-center justify-center gap-2 text-xs sm:text-sm transition-all"
              >
                <Gift className="w-4 h-4 text-amber-950" />
                <span>Thưởng Hoa Điểm Cho Cả {group.name.split(':')[0]}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL: THƯỞNG ĐIỂM TỔ */}
      {awardGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-amber-400 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setAwardGroupModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <span className="text-2xl mb-1 inline-block">{awardGroupModal.icon}</span>
              <h3 className="text-xl font-black text-slate-800">
                Thưởng Hoa Điểm Cho {awardGroupModal.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tất cả thành viên trong tổ sẽ nhận được số hoa điểm tương ứng
              </p>
            </div>

            <div className="space-y-2">
              {criteria
                .filter(c => c.category === 'positive')
                .map(crit => (
                  <button
                    key={crit.id}
                    onClick={() => handleAwardGroup(awardGroupModal, crit)}
                    className="w-full p-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 text-left flex items-center justify-between gap-3 transition-all hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{crit.icon}</span>
                      <div>
                        <div className="font-bold text-slate-800 text-xs sm:text-sm">{crit.name}</div>
                        <div className="text-[11px] text-slate-500">{crit.description}</div>
                      </div>
                    </div>
                    <span className="text-sm font-black px-2.5 py-1 rounded-xl bg-emerald-200 text-emerald-900 shrink-0">
                      +{crit.points}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: THÊM / CHỈNH SỬA TỔ THI ĐUA */}
      {groupModalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn font-sans">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border-4 border-amber-400 relative max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setGroupModalState({ isOpen: false, group: null })}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 mx-auto flex items-center justify-center text-2xl shadow-sm border border-amber-300 mb-2">
                {groupFormData.icon || '🐉'}
              </div>
              <h3 className="text-xl font-black text-slate-800 font-serif">
                {groupModalState.group ? "Chỉnh Sửa Tổ Thi Đua" : "Thêm Tổ Thi Đua Mới"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {groupModalState.group ? "Cập nhật tên, linh vật đại diện và khẩu hiệu của tổ" : "Thiết lập thông tin tổ thi đua mới cho lớp học"}
              </p>
            </div>

            <form onSubmit={handleSaveGroupModal} className="space-y-4 text-xs sm:text-sm">
              {/* Tên Tổ */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên Tổ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tổ 5: Phượng Hoàng Lửa"
                  value={groupFormData.name}
                  onChange={e => setGroupFormData({ ...groupFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                />
              </div>

              {/* Khẩu hiệu / Slogan */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Khẩu Hiệu Thi Đua
                </label>
                <input
                  type="text"
                  placeholder="e.g. Đoàn kết - Tự tin - Bay cao"
                  value={groupFormData.slogan}
                  onChange={e => setGroupFormData({ ...groupFormData, slogan: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Biểu tượng / Linh vật */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Linh Vật Đại Diện</span>
                  <span className="text-xs text-amber-800 font-normal">Đang chọn: {groupFormData.icon}</span>
                </label>
                <div className="grid grid-cols-8 gap-1.5 p-2 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  {ICON_SUGGESTIONS.map(ic => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setGroupFormData({ ...groupFormData, icon: ic })}
                      className={`h-9 w-9 rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer ${
                        groupFormData.icon === ic
                          ? "bg-amber-400 shadow-sm scale-110 border border-amber-600 ring-2 ring-amber-300"
                          : "hover:bg-white"
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Màu sắc chủ đạo */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Gam Màu Đại Diện
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {COLOR_PRESETS.map(col => (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => setGroupFormData({ ...groupFormData, color: col.class })}
                      className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                        groupFormData.color === col.class
                          ? "border-amber-600 bg-amber-50 shadow-xs ring-2 ring-amber-300"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${col.preview} shrink-0`} />
                      <span className="truncate text-[11px]">{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGroupModalState({ isOpen: false, group: null })}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer transition-all"
                >
                  {groupModalState.group ? "Lưu Thay Đổi" : "Tạo Tổ Mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
