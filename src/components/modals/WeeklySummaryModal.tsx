import React, { useEffect } from 'react';
import { Trophy, Crown, Sparkles, Users, Scroll } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student, Group, ClassConfig } from '../../types';
import { ChibiAvatar } from '../ChibiAvatar';
import { soundEngine } from '../../utils/soundEngine';
import { Modal, Button } from '../ui';

interface WeeklySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  groups: Group[];
  config: ClassConfig;
  customBg?: string;
  onOpenCertificate: (student: Student) => void;
}

export const WeeklySummaryModal: React.FC<WeeklySummaryModalProps> = ({
  isOpen,
  onClose,
  students,
  groups,
  config,
  onOpenCertificate
}) => {
  useEffect(() => {
    if (isOpen) {
      soundEngine.playRoyalFanfare();
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sortedStudents = [...students].sort((a, b) => b.points - a.points);
  const top1 = sortedStudents[0];
  const top2 = sortedStudents[1];
  const top3 = sortedStudents[2];

  // Group standings
  const groupStandings = groups.map(g => {
    const members = students.filter(s => s.groupId === g.id);
    const total = members.reduce((sum, s) => sum + s.points, 0);
    return { group: g, total, count: members.length };
  }).sort((a, b) => b.total - a.total);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="xl"
      icon={Trophy}
      title="LỄ TỔNG KẾT & CHỐT ĐIỂM TUẦN"
      subtitle={<>Lớp {config.className} • {config.schoolName} • Giáo viên: {config.teacherName}</>}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Đóng
          </Button>
          <Button
            variant="gold"
            icon={Sparkles}
            onClick={() => {
              soundEngine.playFestiveDrum();
              confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
            }}
          >
            Tung Pháo Hoa Chúc Mừng
          </Button>
        </>
      }
    >
      <div className="font-sans text-ink">
        {/* Header Title */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-100 text-gold-900 font-black text-[11px] uppercase tracking-widest border border-gold-300">
            <Crown className="w-3.5 h-3.5 text-gold-700" />
            <span>Vinh danh tuần</span>
            <Crown className="w-3.5 h-3.5 text-gold-700" />
          </div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-black font-brand text-primary-900">
            Bảng Vàng Thi Đua Tuần Này
          </h2>
        </div>

        {/* Podium Tam Khôi */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end max-w-2xl mx-auto mb-6 pt-2">
          {/* Top 2 */}
          {top2 && (
            <div className="order-2 sm:order-1 flex flex-col items-center text-center p-4 rounded-2xl bg-paper border border-paper-line">
              <ChibiAvatar points={top2.points} gender={top2.gender} size="lg" />
              <div className="mt-2 font-bold text-ink text-sm">{top2.name}</div>
              <span className="mt-1 text-[10px] font-bold px-2 py-0.5 bg-white border border-paper-line text-ink-soft rounded-full">
                🥈 Bảng Nhãn
              </span>
              <div className="text-xs font-black text-primary-800 mt-1">🌸 {top2.points} đ</div>
              <Button size="sm" variant="outline" icon={Scroll} className="mt-2" onClick={() => onOpenCertificate(top2)}>
                Chiếu chỉ
              </Button>
            </div>
          )}

          {/* Top 1 */}
          {top1 && (
            <div className="order-1 sm:order-2 flex flex-col items-center text-center p-4 sm:pb-6 rounded-2xl bg-gradient-to-b from-gold-100 to-gold-50 border border-gold-300 shadow-card">
              <div className="text-2xl mb-1 animate-float-gentle">👑</div>
              <ChibiAvatar points={top1.points} gender={top1.gender} size="xl" showAura={true} />
              <div className="mt-2 font-black text-primary-900 text-base">{top1.name}</div>
              <span className="mt-1 text-xs font-black px-3 py-0.5 bg-gold-300 text-primary-950 rounded-full border border-gold-500">
                🏆 Trạng Nguyên
              </span>
              <div className="text-sm font-black text-primary-700 mt-1">🌸 {top1.points} đ</div>
              <Button size="sm" variant="primary" icon={Scroll} className="mt-2" onClick={() => onOpenCertificate(top1)}>
                Chiếu chỉ
              </Button>
            </div>
          )}

          {/* Top 3 */}
          {top3 && (
            <div className="order-3 sm:order-3 flex flex-col items-center text-center p-4 rounded-2xl bg-paper border border-paper-line">
              <ChibiAvatar points={top3.points} gender={top3.gender} size="lg" />
              <div className="mt-2 font-bold text-ink text-sm">{top3.name}</div>
              <span className="mt-1 text-[10px] font-bold px-2 py-0.5 bg-gold-50 border border-gold-200 text-gold-900 rounded-full">
                🥉 Thám Hoa
              </span>
              <div className="text-xs font-black text-primary-800 mt-1">🌸 {top3.points} đ</div>
              <Button size="sm" variant="outline" icon={Scroll} className="mt-2" onClick={() => onOpenCertificate(top3)}>
                Chiếu chỉ
              </Button>
            </div>
          )}
        </div>

        {/* Group Standings */}
        <div className="bg-paper-warm rounded-2xl p-4 border border-paper-line">
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-3 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-gold-700" />
            <span>Xếp Hạng Thi Đua 4 Tổ Tuần Này</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            {groupStandings.map((st, i) => (
              <div
                key={st.group.id}
                className={`bg-white p-2.5 rounded-xl border shadow-card ${i === 0 ? 'border-gold-400' : 'border-paper-line'}`}
              >
                <div className="text-base mb-0.5">{st.group.icon}</div>
                <div className="font-bold text-ink">{st.group.name.split(':')[0]}</div>
                <div className={`text-[10px] font-bold mt-0.5 ${i === 0 ? 'text-gold-700' : 'text-ink-muted'}`}>
                  {i === 0 ? '🥇 Dẫn đầu' : `Hạng ${i + 1}`}
                </div>
                <div className="font-black text-primary-900 mt-1">{st.total} điểm</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
