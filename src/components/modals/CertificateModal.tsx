import React from 'react';
import { X, Printer, Crown, Sparkles } from 'lucide-react';
import { Student, ClassConfig } from '../../types';
import { getRankByPoints } from '../../utils/ranks';
import { ChibiAvatar } from '../ChibiAvatar';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  config: ClassConfig;
}

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
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl my-auto flex items-stretch">
        {/* Left wooden scroll rod */}
        <div className="hidden sm:flex flex-col items-center justify-between py-2 -mr-3 z-20 shrink-0 select-none">
          <div className="w-7 h-9 rounded-t-full bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-600 shadow-md border border-amber-700 flex items-center justify-center">
            <span className="text-[10px]">🏮</span>
          </div>
          <div className="w-5 flex-1 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-700 shadow-lg border-x border-amber-800 flex flex-col justify-around items-center py-4">
            <div className="w-full h-1 bg-amber-900/40 my-2" />
            <div className="w-full h-1 bg-amber-900/40 my-2" />
            <div className="w-full h-1 bg-amber-900/40 my-2" />
            <div className="w-full h-1 bg-amber-900/40 my-2" />
          </div>
          <div className="w-7 h-9 rounded-b-full bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-600 shadow-md border border-amber-700 flex items-center justify-center">
            <span className="text-[10px]">🏮</span>
          </div>
        </div>

        {/* Center scroll canvas */}
        <div className="flex-1 bg-[#FFFDF7] rounded-2xl sm:rounded-3xl border-4 sm:border-8 border-amber-500 shadow-2xl relative max-h-[92vh] overflow-y-auto font-serif text-amber-950 p-6 sm:p-8">
          <button
            id="btn-close-honor-modal"
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-amber-100 text-amber-800 no-print cursor-pointer"
            title="Đóng (ESC)"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Certificate Inner Canvas */}
          <div className="border-4 border-double border-amber-700 p-6 sm:p-8 rounded-2xl bg-[#FFFBF0] relative shadow-inner text-center">
          <div className="text-xl text-amber-800 mb-2 select-none">
            ⚜️ • • • ❖ • • • ⚜️
          </div>

          <div className="text-xs font-sans font-bold uppercase tracking-widest text-red-800 mb-1">
            CHIẾU CHỈ VINH DANH KHOA BẢNG
          </div>
          <h2 className="text-2xl sm:text-4xl font-black font-brand text-amber-900 mb-2">
            TRẠNG NGUYÊN ĐẤT VIỆT
          </h2>

          <p className="text-xs sm:text-sm italic text-slate-600 mb-6">
            Trường {config.schoolName} • {config.className} • Niên khóa {config.academicYear}
          </p>

          <div className="flex justify-center mb-4">
            <ChibiAvatar points={student.points} gender={student.gender} size="xl" showAura={true} />
          </div>

          <div className="my-4">
            <p className="text-sm font-sans font-medium text-slate-700 mb-1">
              Khen thưởng sĩ tử tài năng:
            </p>
            <h3 className="text-2xl sm:text-3xl font-black font-serif text-red-800 tracking-wider underline decoration-amber-400 decoration-wavy mb-1">
              {student.name}
            </h3>
            <p className="text-xs text-slate-600 font-sans">
              Chức vụ: <b>{student.role}</b> • Ngày sinh: <b>{student.birthDate}</b>
            </p>
          </div>

          {/* Rank box */}
          <div className="bg-amber-100/80 border border-amber-300 rounded-2xl p-4 my-5 text-center max-w-lg mx-auto">
            <div className="text-[11px] uppercase font-sans font-bold text-amber-900 tracking-wider mb-0.5">
              HỌC VỊ ĐẠT ĐƯỢC
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-950 flex items-center justify-center gap-2">
              <span>{rank.badge}</span>
              <span>{rank.title.toUpperCase()}</span>
              <span>{rank.hatIcon}</span>
            </div>
            <div className="text-xs font-bold text-red-700 mt-1 font-sans">
              Gặt hái tổng cộng: {student.points} Hoa Điểm Tốt • {student.stars} Sao Danh Dự
            </div>
            <p className="text-xs text-slate-600 font-sans mt-1.5 italic">
              « {rank.description} »
            </p>
          </div>

          {/* Seals & Signatures */}
          <div className="flex justify-between items-end mt-8 pt-4 border-t border-amber-300/80 text-xs sm:text-sm font-sans">
            <div className="text-center">
              <p className="text-slate-500 mb-8">Ngày cấp: {new Date().toLocaleDateString('vi-VN')}</p>
              <div className="w-20 h-20 mx-auto rounded-full border-2 border-red-600 border-dashed flex items-center justify-center text-red-600 font-black text-[10px] uppercase rotate-[-12deg] shadow-sm select-none">
                TRIỆN ẤN<br />TRẠNG NGUYÊN<br />ĐẤT VIỆT
              </div>
            </div>

            <div className="text-center">
              <p className="text-slate-500 mb-1">{config.teacherTitle}</p>
              <div className="h-14 font-brand text-2xl text-amber-900 flex items-center justify-center italic">
                {config.teacherName.split(' ').slice(-2).join(' ')}
              </div>
              <p className="font-bold text-slate-800">{config.teacherName}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3 no-print font-sans">
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 bg-gradient-to-r from-red-600 to-amber-700 hover:from-red-700 hover:to-amber-800 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In Chiếu Chỉ Khen Thưởng</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded-2xl text-xs sm:text-sm transition-all cursor-pointer"
          >
            Đóng lại
          </button>
        </div>
      </div>

      {/* Right wooden scroll rod */}
      <div className="hidden sm:flex flex-col items-center justify-between py-2 -ml-3 z-20 shrink-0 select-none">
        <div className="w-7 h-9 rounded-t-full bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-600 shadow-md border border-amber-700 flex items-center justify-center">
          <span className="text-[10px]">🏮</span>
        </div>
        <div className="w-5 flex-1 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-700 shadow-lg border-x border-amber-800 flex flex-col justify-around items-center py-4">
          <div className="w-full h-1 bg-amber-900/40 my-2" />
          <div className="w-full h-1 bg-amber-900/40 my-2" />
          <div className="w-full h-1 bg-amber-900/40 my-2" />
          <div className="w-full h-1 bg-amber-900/40 my-2" />
        </div>
        <div className="w-7 h-9 rounded-b-full bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-600 shadow-md border border-amber-700 flex items-center justify-center">
          <span className="text-[10px]">🏮</span>
        </div>
      </div>
    </div>
  </div>
  );
};
