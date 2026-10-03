import React, { useState } from 'react';
import {
  Trophy,
  Users,
  Gift,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Crown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Group, Student, Criterion, PointLog } from '../../types';
import { soundEngine } from '../../utils/soundEngine';
import { storage } from '../../utils/storage';
import { AVATAR_OPTIONS, getRankByPoints } from '../../utils/ranks';
import { getAssetUrl } from '../../utils/assets';
import { notify, confirmDialog } from '../ui/dialog';
import { Button, PageHeader, Modal } from '../ui';

const ICON_SUGGESTIONS = ['🐉', '🐯', '🦅', '🐟', '🦁', '🐢', '🦄', '🕊️', '🦊', '🐼', '🐬', '🦚', '🌟', '🌸', '🎋', '⚡'];

// NOTE: `class` values are persisted in Group.color — keep them unchanged for data compatibility.
const COLOR_PRESETS = [
  { name: 'Vàng Rồng', class: 'from-amber-500 to-orange-600', preview: 'bg-gradient-to-r from-amber-500 to-orange-600' },
  { name: 'Đỏ Hổ', class: 'from-red-500 to-rose-600', preview: 'bg-gradient-to-r from-red-500 to-rose-600' },
  { name: 'Xanh Chim Lạc', class: 'from-emerald-500 to-teal-600', preview: 'bg-gradient-to-r from-emerald-500 to-teal-600' },
  { name: 'Lam Cá Chép', class: 'from-blue-500 to-indigo-600', preview: 'bg-gradient-to-r from-blue-500 to-indigo-600' },
  { name: 'Tím Phượng Hoàng', class: 'from-purple-500 to-pink-600', preview: 'bg-gradient-to-r from-purple-500 to-pink-600' },
  { name: 'Cam Sư Tử', class: 'from-orange-500 to-amber-600', preview: 'bg-gradient-to-r from-orange-500 to-amber-600' },
];

const MEDALS = ['🥇', '🥈', '🥉'];

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
      notify('Vui lòng nhập tên tổ thi đua!');
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

  const handleDeleteGroup = async (groupToDelete: Group) => {
    if (groups.length <= 1) {
      notify('Lớp học phải có ít nhất 1 tổ thi đua! Không thể xóa hết tổ.');
      return;
    }

    const memberCount = students.filter(s => s.groupId === groupToDelete.id).length;
    const confirmMsg = memberCount > 0
      ? `Thầy/Cô có chắc chắn muốn xóa "${groupToDelete.name}"?\n\nHiện có ${memberCount} học sinh trong tổ này. Các học sinh sẽ được tự động chuyển sang tổ khác để không bị mất dữ liệu!`
      : `Thầy/Cô có chắc chắn muốn xóa "${groupToDelete.name}" khỏi danh sách các tổ thi đua?`;

    if (!await confirmDialog(confirmMsg)) return;

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

  const topPoints = groupStats.length > 0 ? groupStats[0].totalPoints : 0;
  const pctOfLeader = (pts: number) => (topPoints > 0 ? Math.round((pts / topPoints) * 100) : 0);

  const getGroupMascotImage = (id: string, name: string) => {
    if (id === 'group-1' || name.includes('Rồng')) return getAssetUrl('/assets/images/to-1-rong-vang.jpg');
    if (id === 'group-2' || name.includes('Hổ')) return getAssetUrl('/assets/images/to-2-ho-dung-manh.jpg');
    if (id === 'group-3' || name.includes('Lạc')) return getAssetUrl('/assets/images/to-3-chim-lac.jpg');
    if (id === 'group-4' || name.includes('Cá Chép')) return getAssetUrl('/assets/images/to-4-ca-chep.jpg');
    return getAssetUrl('/assets/images/trang-ti.jpg');
  };

  // Podium order: 2nd - 1st - 3rd (on sm+). On mobile shows 1st, 2nd, 3rd stacked.
  const podium = groupStats.slice(0, 3);
  const podiumStyles = [
    { order: 'sm:order-2', height: 'sm:pt-8 sm:pb-6', ring: 'border-gold-400 ring-2 ring-gold-300/60 bg-gradient-to-b from-gold-50 to-white', img: 'w-20 h-20 border-gold-400', step: 'bg-gradient-to-b from-gold-300 to-gold-500 text-primary-950 h-10' },
    { order: 'sm:order-1', height: 'sm:mt-6 sm:pt-6 sm:pb-5', ring: 'border-paper-line bg-white', img: 'w-16 h-16 border-paper-line', step: 'bg-paper-warm text-ink-soft h-8' },
    { order: 'sm:order-3', height: 'sm:mt-10 sm:pt-5 sm:pb-4', ring: 'border-paper-line bg-white', img: 'w-14 h-14 border-paper-line', step: 'bg-primary-50 text-primary-800 h-7' },
  ];

  const closeGroupModal = () => setGroupModalState({ isOpen: false, group: null });

  return (
    <div className="space-y-5 font-sans">
      <PageHeader
        icon={Trophy}
        title="Thi Đua Các Tổ"
        subtitle={
          <>
            Đoàn kết cùng tiến bộ · Lớp hiện có <span className="font-bold text-primary-800">{groups.length} tổ</span> thi đua
          </>
        }
        actions={
          <Button id="btn-add-new-group" variant="primary" icon={Plus} onClick={handleOpenAddGroup}>
            Thêm Tổ Mới
          </Button>
        }
      />

      {/* Empty State Banner if no students */}
      {students.length === 0 && (
        <div className="card p-5 border-dashed border-2 border-gold-300 bg-gold-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={getAssetUrl("/assets/images/trang-ti.jpg")}
              alt="Trạng Tí"
              className="w-14 h-14 rounded-2xl object-cover border-2 border-gold-400 shadow-card"
            />
            <div>
              <h4 className="font-black text-ink text-base">Chưa có môn sinh nào được phân tổ</h4>
              <p className="text-xs text-ink-muted mt-0.5">
                Các tổ hiện chưa có thành viên. Thầy/Cô có thể nạp nhanh 32 học sinh mẫu hoặc thêm học sinh để theo dõi thi đua giữa 4 tổ!
              </p>
            </div>
          </div>
          <Button
            variant="gold"
            icon={Sparkles}
            className="shrink-0 whitespace-nowrap"
            onClick={() => {
              const samples = storage.loadSampleStudents();
              setStudents(samples);
            }}
          >
            Nạp 32 học sinh mẫu
          </Button>
        </div>
      )}

      {/* Podium */}
      {podium.length > 0 && (
        <div className="card p-4 sm:p-5 bg-gradient-to-b from-paper-warm to-white">
          <div className="flex items-center gap-2 mb-4 text-xs font-black uppercase tracking-wider text-primary-800">
            <Crown className="w-4 h-4 text-gold-600" />
            Bảng Xếp Hạng Thi Đua Các Tổ
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            {podium.map((stat, idx) => {
              const st = podiumStyles[idx];
              return (
                <div key={stat.group.id} className={`${st.order} flex flex-col`}>
                  <div className={`rounded-2xl border shadow-card px-4 py-4 ${st.height} ${st.ring} flex sm:flex-col items-center gap-3 sm:gap-2 sm:text-center`}>
                    <div className="relative shrink-0">
                      <img
                        src={getGroupMascotImage(stat.group.id, stat.group.name)}
                        alt={stat.group.name}
                        className={`${st.img} rounded-2xl object-cover border-2 shadow-sm`}
                      />
                      <span className="absolute -top-2 -right-2 text-xl drop-shadow">{MEDALS[idx]}</span>
                    </div>
                    <div className="min-w-0 flex-1 sm:w-full">
                      <div className="font-black font-serif text-ink truncate">{stat.group.icon} {stat.group.name}</div>
                      <div className="text-2xl font-black text-primary-800 leading-tight">
                        {stat.totalPoints}
                        <span className="text-xs font-bold text-ink-muted ml-1">hoa điểm</span>
                      </div>
                      <div className="text-[11px] text-ink-muted">{stat.members.length} em · TB {stat.avgPoints}</div>
                    </div>
                  </div>
                  <div className={`hidden sm:flex mt-2 rounded-xl items-center justify-center font-black text-sm ${st.step}`}>
                    Hạng {idx + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Groups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {groupStats.map((stat, rankIdx) => {
          const { group, members, totalPoints, avgPoints, leader } = stat;
          const isFirst = rankIdx === 0;
          const mascotImg = getGroupMascotImage(group.id, group.name);
          const pct = pctOfLeader(totalPoints);

          return (
            <div
              key={group.id}
              className={`card p-4 sm:p-5 transition-all hover:shadow-card-hover flex flex-col ${
                isFirst ? 'border-gold-400 ring-2 ring-gold-300/50' : ''
              }`}
            >
              {/* Rank Tag & Mascot */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={mascotImg}
                      alt={group.name}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-gold-300 shadow-sm"
                    />
                    <span className="absolute -bottom-1 -right-1 text-sm bg-white rounded-full px-1 shadow border border-paper-line">
                      {group.icon}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black font-serif text-base sm:text-lg text-ink truncate">{group.name}</h3>
                    <p className="text-xs text-primary-700 font-medium italic truncate">"{group.slogan}"</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span
                    className={`font-black text-xs px-2.5 py-1 rounded-xl ${
                      rankIdx < 3 ? 'bg-gold-100 text-gold-800' : 'bg-paper-warm text-ink-soft'
                    }`}
                  >
                    {rankIdx < 3 ? `${MEDALS[rankIdx]} Hạng ${rankIdx + 1}` : `Hạng ${rankIdx + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenEditGroup(group)}
                    className="p-1.5 text-ink-muted hover:text-primary-800 hover:bg-paper-warm rounded-lg transition-colors cursor-pointer"
                    title="Chỉnh sửa tổ này"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteGroup(group)}
                    className="p-1.5 text-ink-muted hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
                    title="Xóa bớt tổ này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress vs leader */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-ink-muted mb-1">
                  <span>So với tổ dẫn đầu</span>
                  <span className="text-primary-800">{pct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-paper-warm overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isFirst ? 'bg-gradient-to-r from-gold-400 to-gold-600' : 'bg-gradient-to-r from-gold-400 to-primary-600'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Group Quick Stats */}
              <div className="grid grid-cols-3 gap-2 p-2.5 bg-paper-warm rounded-2xl text-center mb-3">
                <div>
                  <div className="text-[10px] text-ink-muted uppercase font-bold tracking-wide">Tổng Điểm</div>
                  <div className="text-lg font-black text-primary-800 flex items-center justify-center gap-1">
                    <Sparkles className="w-4 h-4 text-gold-500 fill-gold-400" />
                    {totalPoints}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-ink-muted uppercase font-bold tracking-wide">Bình Quân</div>
                  <div className="text-lg font-black text-gold-800">{avgPoints}</div>
                </div>
                <div>
                  <div className="text-[10px] text-ink-muted uppercase font-bold tracking-wide">Thành Viên</div>
                  <div className="text-lg font-black text-ink-soft flex items-center justify-center gap-1">
                    <Users className="w-4 h-4 text-ink-muted" />
                    {members.length} em
                  </div>
                </div>
              </div>

              {/* Leader info */}
              {leader && (
                <div className="text-xs text-ink-muted mb-2 flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-ink-soft">Đại diện phụ trách:</span>
                  <span className="px-2 py-0.5 rounded-full bg-gold-50 border border-gold-200 font-semibold text-ink">
                    {leader.name} ({leader.role})
                  </span>
                </div>
              )}

              {/* Members List */}
              <div className="space-y-1 mb-4 max-h-48 overflow-y-auto pr-1">
                {members.map(m => {
                  const av = AVATAR_OPTIONS.find(a => a.id === m.avatar) || AVATAR_OPTIONS[0];
                  const r = getRankByPoints(m.points);
                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white hover:bg-paper-warm border border-paper-line text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span>{av.emoji}</span>
                        <span className="font-bold text-ink truncate">{m.name}</span>
                        <span className="text-[10px] text-ink-muted hidden sm:inline">({m.role})</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-semibold text-ink-muted">{r.tier}</span>
                        <span className="font-black text-primary-800 bg-primary-50 px-2 py-0.5 rounded-lg">
                          🌸 {m.points}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action: Award group */}
              <Button
                variant="gold"
                icon={Gift}
                className="w-full mt-auto"
                onClick={() => setAwardGroupModal(group)}
              >
                Thưởng Hoa Điểm Cho Cả {group.name.split(':')[0]}
              </Button>
            </div>
          );
        })}
      </div>

      {/* MODAL: THƯỞNG ĐIỂM TỔ */}
      <Modal
        open={!!awardGroupModal}
        onClose={() => setAwardGroupModal(null)}
        icon={Gift}
        size="sm"
        title={awardGroupModal ? <>{awardGroupModal.icon} Thưởng Hoa Điểm Cho {awardGroupModal.name}</> : null}
        subtitle="Tất cả thành viên trong tổ sẽ nhận được số hoa điểm tương ứng"
      >
        {awardGroupModal && (
          <div className="space-y-2">
            {criteria
              .filter(c => c.category === 'positive')
              .map(crit => (
                <button
                  key={crit.id}
                  type="button"
                  onClick={() => handleAwardGroup(awardGroupModal, crit)}
                  className="w-full p-3 rounded-2xl border border-paper-line bg-white hover:border-emerald-300 hover:bg-emerald-50/60 text-left flex items-center justify-between gap-3 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl">{crit.icon}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-ink text-sm">{crit.name}</div>
                      <div className="text-[11px] text-ink-muted">{crit.description}</div>
                    </div>
                  </div>
                  <span className="text-sm font-black px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                    +{crit.points}
                  </span>
                </button>
              ))}
          </div>
        )}
      </Modal>

      {/* MODAL: THÊM / CHỈNH SỬA TỔ THI ĐUA */}
      <Modal
        open={groupModalState.isOpen}
        onClose={closeGroupModal}
        icon={groupModalState.group ? Edit2 : Plus}
        size="sm"
        title={groupModalState.group ? "Chỉnh Sửa Tổ Thi Đua" : "Thêm Tổ Thi Đua Mới"}
        subtitle={groupModalState.group ? "Cập nhật tên, linh vật đại diện và khẩu hiệu của tổ" : "Thiết lập thông tin tổ thi đua mới cho lớp học"}
      >
        <form onSubmit={handleSaveGroupModal} className="space-y-4 text-sm">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-gold-50 border border-gold-200 flex items-center justify-center text-3xl shadow-card">
              {groupFormData.icon || '🐉'}
            </div>
          </div>

          {/* Tên Tổ */}
          <div>
            <label className="block font-bold text-ink-soft mb-1">
              Tên Tổ <span className="text-primary-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Tổ 5: Phượng Hoàng Lửa"
              value={groupFormData.name}
              onChange={e => setGroupFormData({ ...groupFormData, name: e.target.value })}
              className="input font-bold"
            />
          </div>

          {/* Khẩu hiệu / Slogan */}
          <div>
            <label className="block font-bold text-ink-soft mb-1">
              Khẩu Hiệu Thi Đua
            </label>
            <input
              type="text"
              placeholder="e.g. Đoàn kết - Tự tin - Bay cao"
              value={groupFormData.slogan}
              onChange={e => setGroupFormData({ ...groupFormData, slogan: e.target.value })}
              className="input"
            />
          </div>

          {/* Biểu tượng / Linh vật */}
          <div>
            <label className="font-bold text-ink-soft mb-1.5 flex items-center justify-between">
              <span>Linh Vật Đại Diện</span>
              <span className="text-xs text-primary-700 font-normal">Đang chọn: {groupFormData.icon}</span>
            </label>
            <div className="grid grid-cols-8 gap-1.5 p-2 bg-paper-warm rounded-2xl border border-paper-line text-center">
              {ICON_SUGGESTIONS.map(ic => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setGroupFormData({ ...groupFormData, icon: ic })}
                  className={`h-9 w-full rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer ${
                    groupFormData.icon === ic
                      ? "bg-gold-300 shadow-sm scale-110 ring-2 ring-gold-500"
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
            <label className="block font-bold text-ink-soft mb-1.5">
              Gam Màu Đại Diện
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COLOR_PRESETS.map(col => (
                <button
                  key={col.name}
                  type="button"
                  onClick={() => setGroupFormData({ ...groupFormData, color: col.class })}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    groupFormData.color === col.class
                      ? "border-gold-500 bg-gold-50 ring-2 ring-gold-300"
                      : "border-paper-line bg-white hover:bg-paper-warm"
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${col.preview} shrink-0`} />
                  <span className="truncate text-[11px] text-ink-soft">{col.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={closeGroupModal}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              {groupModalState.group ? "Lưu Thay Đổi" : "Tạo Tổ Mới"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
