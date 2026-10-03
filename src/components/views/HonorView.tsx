import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Crown,
  Sparkles,
  Printer,
  X,
  Medal,
  Scroll,
  ListOrdered
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student, ClassConfig } from '../../types';
import { getRankByPoints, AVATAR_OPTIONS, RANK_TIERS } from '../../utils/ranks';
import { soundEngine } from '../../utils/soundEngine';
import { getAssetUrl } from '../../utils/assets';
import { ChibiAvatar } from '../ChibiAvatar';
import { Button, PageHeader, EmptyState } from '../ui';

interface HonorViewProps {
  students: Student[];
  config: ClassConfig;
}

type PodiumPlace = 1 | 2 | 3;

const PODIUM_STYLE: Record<PodiumPlace, {
  id: string;
  order: string;
  medal: string;
  title: string;
  subtitle: string;
  block: string;
  blockHeight: string;
  ring: string;
  avatarSize: 'lg' | 'xl';
  nameClass: string;
  numberClass: string;
  btn: string;
}> = {
  1: {
    id: 'card-tam-khoi-top1',
    order: 'order-1 sm:order-2',
    medal: '👑',
    title: 'Thủ Khoa',
    subtitle: 'Trạng Nguyên Đất Việt',
    block: 'bg-gradient-to-b from-gold-300 via-gold-400 to-gold-600 border-gold-500 text-primary-950',
    blockHeight: 'h-28 sm:h-44',
    ring: 'ring-4 ring-gold-400 shadow-[0_0_28px_rgba(251,191,36,0.55)]',
    avatarSize: 'xl',
    nameClass: 'text-lg sm:text-xl text-primary-900',
    numberClass: 'text-4xl sm:text-5xl',
    btn: 'bg-primary-900 hover:bg-primary-950 text-gold-200 border-gold-400',
  },
  2: {
    id: 'card-tam-khoi-top2',
    order: 'order-2 sm:order-1',
    medal: '🥈',
    title: 'Bảng Nhãn',
    subtitle: 'Bảng Nhãn (Á Khoa 1)',
    block: 'bg-gradient-to-b from-slate-100 via-slate-200 to-slate-300 border-slate-300 text-ink',
    blockHeight: 'h-20 sm:h-32',
    ring: 'ring-4 ring-slate-300',
    avatarSize: 'lg',
    nameClass: 'text-base text-ink',
    numberClass: 'text-3xl sm:text-4xl',
    btn: 'bg-white hover:bg-paper-warm text-ink border-paper-line',
  },
  3: {
    id: 'card-tam-khoi-top3',
    order: 'order-3 sm:order-3',
    medal: '🥉',
    title: 'Thám Hoa',
    subtitle: 'Thám Hoa (Á Khoa 2)',
    block: 'bg-gradient-to-b from-gold-600 via-gold-700 to-gold-800 border-gold-700 text-gold-50',
    blockHeight: 'h-16 sm:h-24',
    ring: 'ring-4 ring-gold-700/70',
    avatarSize: 'lg',
    nameClass: 'text-base text-ink',
    numberClass: 'text-3xl sm:text-4xl',
    btn: 'bg-white hover:bg-paper-warm text-gold-900 border-gold-300',
  },
};

export const HonorView: React.FC<HonorViewProps> = ({ students, config }) => {
  const [selectedStudentForCert, setSelectedStudentForCert] = useState<Student | null>(null);

  // Sort students descending by points
  const sortedStudents = [...students].sort((a, b) => b.points - a.points);
  const top1 = sortedStudents[0];
  const top2 = sortedStudents[1];
  const top3 = sortedStudents[2];
  const restStudents = sortedStudents.slice(3);
  const maxPoints = Math.max(1, top1?.points ?? 1);

  // Fire confetti on first load of Honor View
  useEffect(() => {
    soundEngine.playRoyalFanfare();
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 }
    });
  }, []);

  const fireCelebration = () => {
    soundEngine.playFestiveDrum();
    confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
  };

  const renderPodium = (student: Student | undefined, place: PodiumPlace) => {
    if (!student) return <div className={`${PODIUM_STYLE[place].order} hidden sm:block`} />;
    const p = PODIUM_STYLE[place];
    const rank = getRankByPoints(student.points);
    return (
      <div id={p.id} className={`${p.order} flex flex-col items-center min-w-0`}>
        <div className="relative flex flex-col items-center mb-3 px-1 text-center w-full">
          <span className={`${place === 1 ? 'text-4xl animate-bounce' : 'text-3xl'} mb-1 drop-shadow`}>{p.medal}</span>
          <div className={`rounded-full bg-white p-1 ${p.ring}`}>
            <ChibiAvatar
              points={student.points}
              gender={student.gender}
              size={p.avatarSize}
              customPhotoUrl={student.customPhotoUrl}
              showAura={place === 1}
            />
          </div>
          <span className={`mt-2.5 font-black font-serif leading-tight truncate max-w-full ${p.nameClass}`}>
            {student.name}
          </span>
          <span className={`mt-1 text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border ${
            place === 1
              ? 'bg-gold-100 text-primary-900 border-gold-400'
              : 'bg-paper-warm text-ink-soft border-paper-line'
          }`}>
            {place === 1 ? `🏆 ${p.subtitle} 🏆` : p.subtitle}
          </span>
          <span className={`mt-1 font-black ${place === 1 ? 'text-base text-primary-700' : 'text-sm text-primary-700'}`}>
            🌸 {student.points} Hoa Điểm{place === 1 ? ' Tốt' : ''}
          </span>
          <span className="text-[11px] text-ink-muted">{rank.badge} {rank.title}</span>
        </div>

        {/* Podium block */}
        <div className={`w-full ${p.blockHeight} rounded-t-2xl border-2 border-b-0 ${p.block} flex flex-col items-center justify-center font-serif shadow-card relative overflow-hidden`}>
          <div className="absolute inset-x-0 top-0 h-1.5 bg-white/40" />
          <span className={`${p.numberClass} font-black leading-none drop-shadow-sm`}>{place}</span>
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest mt-0.5">{p.title}</span>
          <button
            type="button"
            onClick={() => setSelectedStudentForCert(student)}
            className={`mt-2 px-3 py-1 text-[11px] font-bold rounded-lg shadow-sm border font-sans transition active:scale-95 cursor-pointer ${p.btn}`}
          >
            Xem Chiếu Chỉ
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 select-none">
      <PageHeader
        icon={Trophy}
        title="Bảng Vàng Vinh Quy Bái Tổ"
        subtitle={<>Khắc tên bia đá nghìn năm rạng rỡ • Rạng danh sĩ tử {config.className}</>}
        actions={
          <Button variant="gold" icon={Sparkles} onClick={fireCelebration}>
            Tung Hô Pháo Hoa Vinh Danh
          </Button>
        }
      />

      {students.length === 0 ? (
        <EmptyState
          image={getAssetUrl("/assets/images/empty-classroom.jpg")}
          title="Bảng Vàng Chưa Có Môn Sinh"
          description="Hiện tại lớp học chưa có học sinh nào. Thầy/Cô hãy thêm học sinh vào danh sách lớp để hệ thống tự động tính điểm và vinh danh Tam Khôi (Trạng Nguyên, Bảng Nhãn, Thám Hoa) trên Bảng Vàng!"
        />
      ) : (
        /* PODIUM TAM KHÔI (TOP 3) — khung sắc phong */
        <div
          id="tam-khoi-stage-arena"
          className="relative rounded-2xl overflow-hidden shadow-card border-2 border-gold-400 bg-paper"
        >
          {/* Banner */}
          <div className="relative h-28 sm:h-36 bg-gradient-to-r from-primary-950 via-primary-800 to-primary-950 overflow-hidden">
            <img
              src={getAssetUrl("/banner-tam-khoi.png")}
              alt="Bảng Vàng Tam Khôi"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-45 mix-blend-luminosity"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-950/90 via-primary-950/30 to-primary-950/60 pointer-events-none" />
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-950/70 border border-gold-400/80 text-gold-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                <Crown className="w-3.5 h-3.5 text-gold-300" />
                <span>Khoa Thi Trạng Nguyên Đất Việt</span>
                <Crown className="w-3.5 h-3.5 text-gold-300" />
              </div>
              <h3 className="mt-2 text-lg sm:text-2xl font-black font-serif text-gold-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] tracking-wide">
                VINH DANH TAM KHÔI ĐỨNG ĐẦU LỚP HỌC
              </h3>
            </div>
          </div>

          {/* Stage */}
          <div className="relative px-4 sm:px-8 pt-6 sm:pt-8">
            <div id="tam-khoi-bg-layer" className="absolute inset-0 bg-gradient-to-b from-gold-50 via-paper to-paper-warm pointer-events-none" />
            <div id="tam-khoi-overlay" className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(theme(colors.gold.600)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* Mascot in corner */}
            <div className="hidden lg:flex absolute top-4 right-5 items-center gap-2 bg-white/90 border border-gold-300 px-2.5 py-1.5 rounded-2xl shadow-card z-10">
              <img
                src={getAssetUrl("/assets/images/trang-ti.jpg")}
                alt="Trạng Tí"
                className="w-9 h-9 rounded-xl object-cover border border-gold-400"
              />
              <div className="text-left">
                <span className="text-[10px] font-bold text-gold-800 uppercase block">Cổ Vũ Sĩ Tử</span>
                <span className="text-xs font-black text-primary-900">Chúc Mừng Tam Khôi!</span>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 lg:gap-8 items-end max-w-4xl mx-auto">
              {renderPodium(top2, 2)}
              {renderPodium(top1, 1)}
              {renderPodium(top3, 3)}
            </div>
          </div>
          <div className="h-2 bg-gradient-to-r from-primary-800 via-gold-500 to-primary-800" />
        </div>
      )}

      {/* XẾP HẠNG CÁC SĨ TỬ CÒN LẠI */}
      {restStudents.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-paper-line bg-paper-warm">
            <h3 className="text-base sm:text-lg font-black font-serif text-primary-900 flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-gold-600" />
              <span>Bảng Xếp Hạng Sĩ Tử</span>
            </h3>
            <span className="text-xs font-bold text-ink-muted">Hạng 4 – {sortedStudents.length}</span>
          </div>
          <ol className="divide-y divide-paper-line">
            {restStudents.map((s, i) => {
              const rank = getRankByPoints(s.points);
              const pct = Math.max(2, Math.round((s.points / maxPoints) * 100));
              return (
                <li key={s.id} className="flex items-center gap-3 px-4 sm:px-5 py-2.5 hover:bg-paper transition">
                  <span className="w-8 h-8 shrink-0 rounded-xl bg-paper-warm border border-paper-line text-ink-soft font-black text-sm flex items-center justify-center">
                    {i + 4}
                  </span>
                  <ChibiAvatar points={s.points} gender={s.gender} size="sm" customPhotoUrl={s.customPhotoUrl} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-ink text-sm truncate">{s.name}</span>
                      <span className="font-black text-primary-700 text-sm shrink-0">🌸 {s.points}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 rounded-full bg-paper-warm overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[11px] text-ink-muted shrink-0 hidden sm:inline">{rank.badge} {rank.title}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedStudentForCert(s)}
                    className="p-2 rounded-lg text-gold-700 hover:text-primary-800 hover:bg-gold-50 shrink-0 cursor-pointer"
                    title="Xem chiếu chỉ"
                  >
                    <Scroll className="w-4 h-4" />
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* DANH SÁCH THEO 6 CẤP BẬC KHOA BẢNG */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-black font-serif text-primary-900 flex items-center gap-2">
          <Medal className="w-5 h-5 text-gold-600" />
          <span>Bảng Vinh Danh Theo Cấp Bậc Học Vị</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...RANK_TIERS].reverse().map(tier => {
            const studentsInTier = students.filter(s => getRankByPoints(s.points).tier === tier.tier);

            return (
              <div
                key={tier.tier}
                className={`card p-4 border-t-4 ${tier.cardBorderClass} flex flex-col`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-paper-line mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-2xl">{tier.badge}</span>
                    <div className="min-w-0">
                      <h4 className={`font-black text-base font-serif truncate ${tier.color}`}>{tier.title}</h4>
                      <div className="text-[11px] text-ink-muted">
                        Mốc điểm: {tier.minPoints} - {tier.maxPoints === 9999 ? '∞' : tier.maxPoints} đ
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-paper-warm border border-paper-line rounded-full text-ink-soft shrink-0">
                    {studentsInTier.length} em
                  </span>
                </div>

                <p className="text-xs text-ink-muted font-serif italic mb-3">
                  {tier.description}
                </p>

                {/* List students */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {studentsInTier.length === 0 ? (
                    <p className="text-xs text-ink-muted italic py-2 text-center">Chưa có học sinh đạt cấp này</p>
                  ) : (
                    studentsInTier.map(s => {
                      const av = AVATAR_OPTIONS.find(a => a.id === s.avatar) || AVATAR_OPTIONS[0];
                      return (
                        <div
                          key={s.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-paper border border-paper-line text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span>{av.emoji}</span>
                            <span className="font-bold text-ink truncate">{s.name}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-black text-primary-700">🌸 {s.points}</span>
                            <button
                              type="button"
                              onClick={() => setSelectedStudentForCert(s)}
                              className="p-1 text-gold-700 hover:text-primary-800 cursor-pointer"
                              title="Xem chiếu chỉ"
                            >
                              <Scroll className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: CHIẾU CHỈ KHEN THƯỞNG HOÀNG GIA (CERTIFICATE) */}
      {selectedStudentForCert && (() => {
        const s = selectedStudentForCert;
        const rank = getRankByPoints(s.points);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-primary-950/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-paper-warm rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-pop border-4 border-gold-500 relative max-h-[95vh] overflow-y-auto text-ink font-serif animate-pop-in">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedStudentForCert(null)}
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-gold-100 text-gold-800 no-print cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Certificate Canvas Box */}
              <div className="border-4 border-double border-gold-700 p-5 sm:p-8 rounded-2xl bg-paper relative shadow-inner-gold text-center">
                {/* Traditional corner ornaments */}
                <div className="text-xl text-gold-700 mb-2 select-none">
                  ⚜️ • • • ❖ • • • ⚜️
                </div>

                <div className="text-xs font-sans font-bold uppercase tracking-widest text-primary-600 mb-1">
                  CHIẾU CHỈ VINH DANH KHOA BẢNG
                </div>
                <h2 className="text-2xl sm:text-4xl font-black font-brand text-primary-900 mb-2">
                  TRẠNG NGUYÊN ĐẤT VIỆT
                </h2>

                <p className="text-xs sm:text-sm font-serif italic text-ink-muted mb-6">
                  Trường {config.schoolName} • {config.className} • Niên khóa {config.academicYear}
                </p>

                <div className="my-6 flex flex-col items-center">
                  <ChibiAvatar points={s.points} gender={s.gender} size="lg" customPhotoUrl={s.customPhotoUrl} className="mb-3" />
                  <p className="text-sm sm:text-base font-sans font-medium text-ink-soft mb-2">
                    Khen thưởng sĩ tử tài năng:
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-black font-serif text-primary-800 tracking-wider underline decoration-gold-400 decoration-wavy mb-2">
                    {s.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-soft">
                    Chức vụ: <b>{s.role}</b> • Ngày sinh: <b>{s.birthDate}</b>
                  </p>
                </div>

                {/* Achievement */}
                <div className="bg-gold-50 border border-gold-300 rounded-2xl p-4 my-6 text-center max-w-lg mx-auto">
                  <div className="text-xs uppercase font-sans font-bold text-gold-800 tracking-wider mb-1">
                    HỌC VỊ ĐẠT ĐƯỢC
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-primary-900 font-serif flex items-center justify-center gap-2">
                    <span>{rank.badge}</span>
                    <span>{rank.title.toUpperCase()}</span>
                    <span>{rank.hatIcon}</span>
                  </div>
                  <div className="text-sm font-bold text-primary-700 mt-1">
                    Gặt hái tổng cộng: {s.points} Hoa Điểm Tốt • {s.stars} Sao Danh Dự
                  </div>
                  <p className="text-xs text-ink-muted font-sans mt-2 italic">
                    « {rank.description} »
                  </p>
                </div>

                {/* Teacher Seal & Signature */}
                <div className="flex justify-between items-end mt-8 pt-4 border-t border-gold-300/80 text-xs sm:text-sm">
                  <div className="text-center font-sans">
                    <p className="text-ink-muted mb-6 sm:mb-10">Ngày cấp: {new Date().toLocaleDateString('vi-VN')}</p>
                    <div className="w-20 h-20 mx-auto rounded-full border-2 border-primary-600 border-dashed flex items-center justify-center text-primary-600 font-black text-[10px] uppercase rotate-[-12deg] select-none leading-tight">
                      TRIỆN ẤN<br />TRẠNG NGUYÊN<br />ĐẤT VIỆT
                    </div>
                  </div>

                  <div className="text-center font-sans">
                    <p className="text-ink-muted mb-1">{config.teacherTitle}</p>
                    <div className="h-14 font-brand text-2xl text-primary-900 flex items-center justify-center italic">
                      {config.teacherName.split(' ').slice(-2).join(' ')}
                    </div>
                    <p className="font-bold text-ink">{config.teacherName}</p>
                  </div>
                </div>
              </div>

              {/* Print / Close Actions */}
              <div className="mt-4 sm:mt-6 flex gap-3 no-print font-sans">
                <Button variant="primary" size="lg" icon={Printer} className="flex-1" onClick={() => window.print()}>
                  In Chiếu Chỉ Khen Thưởng
                </Button>
                <Button variant="outline" size="lg" onClick={() => setSelectedStudentForCert(null)}>
                  Đóng lại
                </Button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
