import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Crown, 
  Award, 
  Sparkles, 
  Printer, 
  X, 
  Star, 
  Flame,
  Medal,
  Scroll
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student, ClassConfig } from '../../types';
import { getRankByPoints, AVATAR_OPTIONS, RANK_TIERS } from '../../utils/ranks';
import { soundEngine } from '../../utils/soundEngine';

interface HonorViewProps {
  students: Student[];
  config: ClassConfig;
}

export const HonorView: React.FC<HonorViewProps> = ({ students, config }) => {
  const [selectedStudentForCert, setSelectedStudentForCert] = useState<Student | null>(null);

  // Sort students descending by points
  const sortedStudents = [...students].sort((a, b) => b.points - a.points);
  const top1 = sortedStudents[0];
  const top2 = sortedStudents[1];
  const top3 = sortedStudents[2];

  // Fire confetti on first load of Honor View
  useEffect(() => {
    soundEngine.playRoyalFanfare();
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 }
    });
  }, []);

  return (
    <div className="space-y-8 select-none">
      {/* Hero Honor Banner with 2K Authentic Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950 via-amber-900 to-red-950 p-6 sm:p-10 text-center text-amber-50 shadow-2xl border-3 md:border-4 border-amber-400">
        <div className="absolute inset-0 opacity-40 mix-blend-luminosity">
          <img
            src="/banner-tam-khoi.png"
            alt="Bảng Vàng Tam Khôi"
            className="w-full h-full object-cover object-center transform scale-105"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#3b0b0b]/90 via-transparent to-[#3b0b0b]/60 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/80 border border-amber-400 text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-widest mb-3">
            <Crown className="w-4 h-4 text-yellow-400 animate-bounce" />
            <span>KHOA THI TRẠNG NGUYÊN ĐẤT VIỆT</span>
            <Crown className="w-4 h-4 text-yellow-400 animate-bounce" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black font-brand text-yellow-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] mb-2">
            Bảng Vàng Vinh Quy Bái Tổ
          </h2>
          <p className="text-sm sm:text-base font-serif italic text-amber-200 mb-6">
            « Khắc tên bia đá nghìn năm rạng rỡ • Rạng danh sĩ tử {config.className} »
          </p>

          <button
            onClick={() => {
              soundEngine.playFestiveDrum();
              confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 hover:from-yellow-500 hover:to-amber-600 text-amber-950 font-black text-sm rounded-full shadow-lg border-2 border-yellow-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-950" />
            <span>Tung Hô Pháo Hoa Vinh Danh</span>
          </button>
        </div>
      </div>

      {/* Empty State when no students exist */}
      {students.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border-2 border-dashed border-amber-300 text-center max-w-2xl mx-auto my-6">
          <img 
            src="/assets/images/empty-classroom.jpg" 
            alt="Lớp học trống" 
            className="w-64 h-48 sm:w-80 sm:h-56 object-cover rounded-2xl shadow-md border-4 border-amber-300 mx-auto mb-6"
          />
          <h3 className="text-2xl font-black text-slate-800 font-serif mb-2">
            Bảng Vàng Chưa Có Môn Sinh
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Hiện tại lớp học chưa có học sinh nào. Thầy/Cô hãy thêm học sinh vào danh sách lớp để hệ thống tự động tính điểm và vinh danh Tam Khôi (Trạng Nguyên, Bảng Nhãn, Thám Hoa) trên Bảng Vàng!
          </p>
        </div>
      ) : (
        /* PODIUM TAM KHÔI (TOP 3) */
        <div
          id="tam-khoi-stage-arena"
          className="bg-white/80 backdrop-blur rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-amber-300 relative overflow-hidden"
        >
          <div id="tam-khoi-bg-layer" className="absolute inset-0 bg-gradient-to-b from-amber-50/50 via-white/80 to-amber-100/40 pointer-events-none" />
          <div id="tam-khoi-overlay" className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Mascot in corner */}
          <div className="hidden sm:flex absolute -top-5 right-6 items-center gap-2 bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-2xl shadow-sm z-10">
            <img 
              src="/assets/images/trang-ti.jpg" 
              alt="Trạng Tí" 
              className="w-10 h-10 rounded-xl object-cover border border-amber-400"
            />
            <div className="text-left">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Cổ Vũ Sĩ Tử</span>
              <span className="text-xs font-black text-amber-950">Chúc Mừng Tam Khôi!</span>
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-center text-amber-950 font-serif mb-8 flex items-center justify-center gap-2 relative z-10">
            <span>🏆</span>
            <span>VINH DANH TAM KHÔI ĐỨNG ĐẦU LỚP HỌC</span>
            <span>🏆</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto pt-6 relative z-10">
          {/* Top 2: BẢNG NHÃN */}
          {top2 && (() => {
            const avatar = AVATAR_OPTIONS.find(a => a.id === top2.avatar) || AVATAR_OPTIONS[0];
            return (
              <div id="card-tam-khoi-top2" className="order-2 md:order-1 flex flex-col items-center">
                <div className="relative mb-3 flex flex-col items-center">
                  <span className="text-3xl mb-1 drop-shadow">🥈</span>
                  <div className={`w-20 h-20 rounded-2xl ${avatar.bg} border-4 border-slate-300 shadow-xl flex items-center justify-center text-4xl relative`}>
                    <span>{avatar.emoji}</span>
                    <span className="absolute -top-2 -right-2 text-xl">🥈</span>
                  </div>
                  <span className="mt-2 font-black text-slate-800 text-base">{top2.name}</span>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-300 mt-0.5">
                    Bảng Nhãn (Á Khoa 1)
                  </span>
                  <span className="text-sm font-black text-amber-800 mt-1">
                    🌸 {top2.points} Hoa Điểm
                  </span>
                </div>
                {/* Podium block */}
                <div className="w-full h-32 rounded-t-2xl bg-gradient-to-t from-slate-400 to-slate-200 border-2 border-slate-300 flex flex-col items-center justify-center text-slate-800 font-serif shadow-inner">
                  <span className="text-2xl font-black">2</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Bảng Nhãn</span>
                  <button
                    onClick={() => setSelectedStudentForCert(top2)}
                    className="mt-2 px-3 py-1 bg-white hover:bg-slate-50 text-slate-800 text-[11px] font-bold rounded-lg shadow border border-slate-300"
                  >
                    Xem Chiếu Chỉ
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Top 1: TRẠNG NGUYÊN (BỤC CAO NHẤT) */}
          {top1 && (() => {
            const avatar = AVATAR_OPTIONS.find(a => a.id === top1.avatar) || AVATAR_OPTIONS[0];
            return (
              <div id="card-tam-khoi-top1" className="order-1 md:order-2 flex flex-col items-center -mt-6">
                <div className="relative mb-3 flex flex-col items-center">
                  <div className="text-4xl mb-1 animate-bounce drop-shadow">👑</div>
                  <div className={`w-24 h-24 rounded-3xl ${avatar.bg} border-4 border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.6)] ring-4 ring-amber-300 flex items-center justify-center text-5xl relative animate-pulse`}>
                    <span>{avatar.emoji}</span>
                    <span className="absolute -top-3 -right-3 text-2xl">🦅</span>
                  </div>
                  <span className="mt-2 font-black text-amber-950 text-lg sm:text-xl drop-shadow">{top1.name}</span>
                  <span className="text-xs font-black text-amber-900 bg-amber-200 px-3 py-1 rounded-full border border-amber-400 mt-0.5 shadow-sm">
                    🏆 Trạng Nguyên Đất Việt 🏆
                  </span>
                  <span className="text-base font-black text-red-700 mt-1">
                    🌸 {top1.points} Hoa Điểm Tốt
                  </span>
                </div>
                {/* Podium block */}
                <div className="w-full h-44 rounded-t-2xl bg-gradient-to-t from-amber-500 via-yellow-400 to-amber-300 border-2 border-yellow-500 flex flex-col items-center justify-center text-amber-950 font-serif shadow-xl">
                  <span className="text-3xl font-black">1</span>
                  <span className="text-sm font-black uppercase tracking-widest">Thủ Khoa</span>
                  <button
                    onClick={() => setSelectedStudentForCert(top1)}
                    className="mt-3 px-4 py-1.5 bg-amber-950 hover:bg-amber-900 text-yellow-300 text-xs font-bold rounded-xl shadow-md border border-yellow-400 active:scale-95 transition-all"
                  >
                    Xem Chiếu Chỉ
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Top 3: THÁM HOA */}
          {top3 && (() => {
            const avatar = AVATAR_OPTIONS.find(a => a.id === top3.avatar) || AVATAR_OPTIONS[0];
            return (
              <div id="card-tam-khoi-top3" className="order-3 md:order-3 flex flex-col items-center">
                <div className="relative mb-3 flex flex-col items-center">
                  <span className="text-3xl mb-1 drop-shadow">🥉</span>
                  <div className={`w-20 h-20 rounded-2xl ${avatar.bg} border-4 border-amber-600 shadow-xl flex items-center justify-center text-4xl relative`}>
                    <span>{avatar.emoji}</span>
                    <span className="absolute -top-2 -right-2 text-xl">🥉</span>
                  </div>
                  <span className="mt-2 font-black text-slate-800 text-base">{top3.name}</span>
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 mt-0.5">
                    Thám Hoa (Á Khoa 2)
                  </span>
                  <span className="text-sm font-black text-amber-800 mt-1">
                    🌸 {top3.points} Hoa Điểm
                  </span>
                </div>
                {/* Podium block */}
                <div className="w-full h-24 rounded-t-2xl bg-gradient-to-t from-amber-700 to-amber-500 border-2 border-amber-600 flex flex-col items-center justify-center text-amber-50 font-serif shadow-inner">
                  <span className="text-2xl font-black">3</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Thám Hoa</span>
                  <button
                    onClick={() => setSelectedStudentForCert(top3)}
                    className="mt-2 px-3 py-1 bg-white hover:bg-amber-50 text-amber-900 text-[11px] font-bold rounded-lg shadow border border-amber-300"
                  >
                    Xem Chiếu Chỉ
                  </button>
                </div>
              </div>
            );
          })()}
          </div>
        </div>
      )}

      {/* DANH SÁCH THEO 6 CẤP BẬC KHOA BẢNG */}
      <div className="space-y-6">
        <h3 className="text-xl sm:text-2xl font-black text-slate-800 font-serif flex items-center gap-2">
          <Medal className="w-6 h-6 text-amber-600" />
          <span>Bảng Vinh Danh Theo Cấp Bậc Học Vị</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...RANK_TIERS].reverse().map(tier => {
            const studentsInTier = students.filter(s => getRankByPoints(s.points).tier === tier.tier);

            return (
              <div
                key={tier.tier}
                className={`bg-white rounded-3xl p-5 border-2 ${tier.cardBorderClass} shadow-md flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{tier.badge}</span>
                      <div>
                        <h4 className={`font-black text-base ${tier.color}`}>{tier.title}</h4>
                        <div className="text-[11px] text-slate-400">
                          Mốc điểm: {tier.minPoints} - {tier.maxPoints === 9999 ? '∞' : tier.maxPoints} đ
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 rounded-full text-slate-700">
                      {studentsInTier.length} em
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-serif italic mb-3">
                    {tier.description}
                  </p>

                  {/* List students */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {studentsInTier.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2 text-center">Chưa có học sinh đạt cấp này</p>
                    ) : (
                      studentsInTier.map(s => {
                        const av = AVATAR_OPTIONS.find(a => a.id === s.avatar) || AVATAR_OPTIONS[0];
                        return (
                          <div
                            key={s.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span>{av.emoji}</span>
                              <span className="font-bold text-slate-800 truncate">{s.name}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-black text-amber-900">🌸 {s.points}</span>
                              <button
                                onClick={() => setSelectedStudentForCert(s)}
                                className="p-1 text-amber-700 hover:text-amber-900"
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
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: CHIẾU CHỈ KHEN THƯỞNG HOÀNG GIA (CERTIFICATE) */}
      {selectedStudentForCert && (() => {
        const s = selectedStudentForCert;
        const rank = getRankByPoints(s.points);
        const avatar = AVATAR_OPTIONS.find(a => a.id === s.avatar) || AVATAR_OPTIONS[0];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
            <div className="bg-amber-50 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border-8 border-amber-500 relative max-h-[95vh] overflow-y-auto text-amber-950 font-serif">
              {/* Close Button */}
              <button
                onClick={() => setSelectedStudentForCert(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-amber-200 text-amber-800 no-print"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Certificate Canvas Box */}
              <div className="border-4 border-double border-amber-700 p-6 sm:p-8 rounded-2xl bg-[#fffcf5] relative shadow-inner text-center">
                {/* Traditional corner ornaments */}
                <div className="text-xl text-amber-800 mb-2 select-none">
                  ⚜️ • • • ❖ • • • ⚜️
                </div>

                <div className="text-xs font-sans font-bold uppercase tracking-widest text-red-700 mb-1">
                  CHIẾU CHỈ VINH DANH KHOA BẢNG
                </div>
                <h2 className="text-2xl sm:text-4xl font-black font-brand text-amber-900 mb-2">
                  TRẠNG NGUYÊN ĐẤT VIỆT
                </h2>

                <p className="text-xs sm:text-sm font-serif italic text-slate-600 mb-6">
                  Trường {config.schoolName} • {config.className} • Niên khóa {config.academicYear}
                </p>

                <div className="my-6">
                  <p className="text-sm sm:text-base font-sans font-medium text-slate-700 mb-2">
                    Khen thưởng sĩ tử tài năng:
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-black font-serif text-red-800 tracking-wider underline decoration-amber-400 decoration-wavy mb-2">
                    {s.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Chức vụ: <b>{s.role}</b> • Ngày sinh: <b>{s.birthDate}</b>
                  </p>
                </div>

                {/* Achievement */}
                <div className="bg-amber-100/70 border border-amber-300 rounded-2xl p-4 my-6 text-center max-w-lg mx-auto">
                  <div className="text-xs uppercase font-sans font-bold text-amber-900 tracking-wider mb-1">
                    HỌC VỊ ĐẠT ĐƯỢC
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-950 font-serif flex items-center justify-center gap-2">
                    <span>{rank.badge}</span>
                    <span>{rank.title.toUpperCase()}</span>
                    <span>{rank.hatIcon}</span>
                  </div>
                  <div className="text-sm font-bold text-red-700 mt-1">
                    Gặt hái tổng cộng: {s.points} Hoa Điểm Tốt • {s.stars} Sao Danh Dự
                  </div>
                  <p className="text-xs text-slate-600 font-sans mt-2 italic">
                    « {rank.description} »
                  </p>
                </div>

                {/* Teacher Seal & Signature */}
                <div className="flex justify-between items-end mt-8 pt-4 border-t border-amber-300/80 text-xs sm:text-sm">
                  <div className="text-center font-sans">
                    <p className="text-slate-500 mb-10">Ngày cấp: {new Date().toLocaleDateString('vi-VN')}</p>
                    <div className="w-20 h-20 mx-auto rounded-full border-2 border-red-600 border-dashed flex items-center justify-center text-red-600 font-black text-[10px] uppercase rotate-[-12deg] shadow-sm select-none">
                      TRIỆN ẤN<br />TRẠNG NGUYÊN<br />ĐẤT VIỆT
                    </div>
                  </div>

                  <div className="text-center font-sans">
                    <p className="text-slate-500 mb-1">{config.teacherTitle}</p>
                    <div className="h-14 font-brand text-2xl text-amber-900 flex items-center justify-center italic">
                      {config.teacherName.split(' ').slice(-2).join(' ')}
                    </div>
                    <p className="font-bold text-slate-800">{config.teacherName}</p>
                  </div>
                </div>
              </div>

              {/* Print / Close Actions */}
              <div className="mt-6 flex gap-3 no-print">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-gradient-to-r from-red-600 to-amber-700 hover:from-red-700 hover:to-amber-800 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 text-sm transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>In Chiếu Chỉ Khen Thưởng</span>
                </button>
                <button
                  onClick={() => setSelectedStudentForCert(null)}
                  className="px-6 py-3 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded-2xl text-sm transition-all"
                >
                  Đóng lại
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
