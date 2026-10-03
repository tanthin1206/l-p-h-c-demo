import React from 'react';
import { X, Printer } from 'lucide-react';
import { Student, ClassConfig } from '../../types';
import { getRankByPoints } from '../../utils/ranks';
import { ChibiAvatar } from '../ChibiAvatar';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  config: ClassConfig;
}

/** Trục cuộn gỗ hai bên chiếu chỉ */
const ScrollRod: React.FC<{ side: 'left' | 'right' }> = ({ side }) => (
  <div
    className={`hidden sm:flex flex-col items-center justify-between py-2 z-20 shrink-0 select-none ${
      side === 'left' ? '-mr-3' : '-ml-3'
    }`}
  >
    <div className="w-7 h-9 rounded-t-full bg-gradient-to-r from-gold-400 via-gold-200 to-gold-600 shadow-sm border border-gold-700 flex items-center justify-center">
      <span className="text-[10px]">🏮</span>
    </div>
    <div className="w-5 flex-1 bg-gradient-to-r from-gold-600 via-gold-300 to-gold-700 shadow-card border-x border-gold-800 flex flex-col justify-around items-center py-4">
      <div className="w-full h-1 bg-gold-900/40 my-2" />
      <div className="w-full h-1 bg-gold-900/40 my-2" />
      <div className="w-full h-1 bg-gold-900/40 my-2" />
      <div className="w-full h-1 bg-gold-900/40 my-2" />
    </div>
    <div className="w-7 h-9 rounded-b-full bg-gradient-to-r from-gold-400 via-gold-200 to-gold-600 shadow-sm border border-gold-700 flex items-center justify-center">
      <span className="text-[10px]">🏮</span>
    </div>
  </div>
);

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  student,
  config
}) => {
  if (!isOpen || !student) return null;

  const rank = getRankByPoints(student.points);

  return (
    <div
      id="modal-honor-scroll"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-primary-950/60 backdrop-blur-[2px] overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-4xl my-auto flex items-stretch animate-pop-in">
        <ScrollRod side="left" />

        {/* Center scroll canvas */}
        <div className="flex-1 bg-paper rounded-3xl border-4 sm:border-[6px] border-gold-400 shadow-pop relative max-h-[92vh] overflow-y-auto font-serif text-ink p-4 sm:p-8">
          <button
            id="btn-close-honor-modal"
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 rounded-lg text-ink-muted hover:bg-paper-warm hover:text-ink no-print cursor-pointer z-10"
            title="Đóng (ESC)"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Certificate Inner Canvas */}
          <div className="border-4 border-double border-gold-700 p-5 sm:p-8 rounded-2xl bg-gradient-to-b from-gold-50 to-paper relative shadow-inner-gold text-center">
            <div className="text-xl text-gold-700 mb-2 select-none">
              ⚜️ • • • ❖ • • • ⚜️
            </div>

            <div className="text-xs font-sans font-bold uppercase tracking-widest text-primary-700 mb-1">
              CHIẾU CHỈ VINH DANH KHOA BẢNG
            </div>
            <h2 className="text-2xl sm:text-4xl font-black font-brand text-primary-900 mb-2">
              TRẠNG NGUYÊN ĐẤT VIỆT
            </h2>

            <p className="text-xs sm:text-sm italic text-ink-muted mb-6">
              Trường {config.schoolName} • {config.className} • Niên khóa {config.academicYear}
            </p>

            <div className="flex justify-center mb-4">
              <ChibiAvatar points={student.points} gender={student.gender} size="xl" showAura={true} />
            </div>

            <div className="my-4">
              <p className="text-sm font-sans font-medium text-ink-soft mb-1">
                Khen thưởng sĩ tử tài năng:
              </p>
              <h3 className="text-2xl sm:text-3xl font-black font-serif text-primary-800 tracking-wider underline decoration-gold-400 decoration-wavy mb-1 break-words">
                {student.name}
              </h3>
              <p className="text-xs text-ink-muted font-sans">
                Chức vụ: <b className="text-ink-soft">{student.role}</b> • Ngày sinh: <b className="text-ink-soft">{student.birthDate}</b>
              </p>
            </div>

            {/* Rank box */}
            <div className="bg-gold-100/70 border border-gold-300 rounded-2xl p-4 my-5 text-center max-w-lg mx-auto">
              <div className="text-[11px] uppercase font-sans font-bold text-gold-800 tracking-wider mb-0.5">
                HỌC VỊ ĐẠT ĐƯỢC
              </div>
              <div className="text-xl sm:text-2xl font-black text-ink flex items-center justify-center gap-2 flex-wrap">
                <span>{rank.badge}</span>
                <span>{rank.title.toUpperCase()}</span>
                <span>{rank.hatIcon}</span>
              </div>
              <div className="text-xs font-bold text-primary-700 mt-1 font-sans">
                Gặt hái tổng cộng: {student.points} Hoa Điểm Tốt • {student.stars} Sao Danh Dự
              </div>
              <p className="text-xs text-ink-muted font-sans mt-1.5 italic">
                « {rank.description} »
              </p>
            </div>

            {/* Seals & Signatures */}
            <div className="flex justify-between items-end gap-4 mt-8 pt-4 border-t border-gold-300/80 text-xs sm:text-sm font-sans">
              <div className="text-center">
                <p className="text-ink-muted mb-8">Ngày cấp: {new Date().toLocaleDateString('vi-VN')}</p>
                <div className="w-20 h-20 mx-auto rounded-full border-2 border-primary-600 border-dashed flex items-center justify-center text-primary-600 font-black text-[10px] uppercase rotate-[-12deg] shadow-sm select-none">
                  TRIỆN ẤN<br />TRẠNG NGUYÊN<br />ĐẤT VIỆT
                </div>
              </div>

              <div className="text-center">
                <p className="text-ink-muted mb-1">{config.teacherTitle}</p>
                <div className="h-14 font-brand text-2xl text-primary-900 flex items-center justify-center italic">
                  {config.teacherName.split(' ').slice(-2).join(' ')}
                </div>
                <p className="font-bold text-ink">{config.teacherName}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 sm:mt-6 flex gap-2.5 no-print font-sans">
            <button
              onClick={() => window.print()}
              className="flex-1 py-3 bg-primary-800 hover:bg-primary-900 text-gold-100 font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 text-xs sm:text-sm transition-all active:scale-[0.97] cursor-pointer"
            >
              <Printer className="w-4 h-4 text-gold-300" />
              <span>In Chiếu Chỉ Khen Thưởng</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 sm:px-6 py-3 bg-white border border-paper-line hover:border-gold-400 text-ink-soft hover:text-ink font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
            >
              Đóng lại
            </button>
          </div>
        </div>

        <ScrollRod side="right" />
      </div>
    </div>
  );
};
