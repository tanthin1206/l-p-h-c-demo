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
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Group, Student, Criterion, PointLog } from '../../types';
import { soundEngine } from '../../utils/soundEngine';
import { storage } from '../../utils/storage';
import { AVATAR_OPTIONS, getRankByPoints } from '../../utils/ranks';
import { getAssetUrl } from '../../utils/assets';

interface GroupsViewProps {
  groups: Group[];
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  criteria: Criterion[];
  pointLogs: PointLog[];
  setPointLogs: React.Dispatch<React.SetStateAction<PointLog[]>>;
}

export const GroupsView: React.FC<GroupsViewProps> = ({
  groups,
  students,
  setStudents,
  criteria,
  pointLogs,
  setPointLogs
}) => {
  const [awardGroupModal, setAwardGroupModal] = useState<Group | null>(null);

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

  const getGroupMascotImage = (id: string, name: string) => {
    if (id === 'group-1' || name.includes('Rồng')) return getAssetUrl('/assets/images/to-1-rong-vang.jpg');
    if (id === 'group-2' || name.includes('Hổ')) return getAssetUrl('/assets/images/to-2-ho-dung-manh.jpg');
    if (id === 'group-3' || name.includes('Lạc')) return getAssetUrl('/assets/images/to-3-chim-lac.jpg');
    if (id === 'group-4' || name.includes('Cá Chép')) return getAssetUrl('/assets/images/to-4-ca-chep.jpg');
    return getAssetUrl('/assets/images/trang-ti.jpg');
  };

  return (
    <div className="space-y-8">
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
            « Bốn tổ thi đua học tốt - rèn nghiêm - kiến tạo tập thể vững mạnh »
          </p>
        </div>
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
                  <div>
                    <h3 className="font-black text-xl text-slate-800">{group.name}</h3>
                    <p className="text-xs text-amber-700 font-medium italic">"{group.slogan}"</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-black text-sm px-3 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                  {isFirst ? '🥇 Hạng 1' : rankIdx === 1 ? '🥈 Hạng 2' : rankIdx === 2 ? '🥉 Hạng 3' : 'Hạng 4'}
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
    </div>
  );
};
