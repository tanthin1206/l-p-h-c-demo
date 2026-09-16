import React from 'react';
import { 
  Menu, 
  School, 
  User, 
  Volume2, 
  VolumeX, 
  Tv, 
  Sparkles, 
  Trophy, 
  Dice5,
  GraduationCap
} from 'lucide-react';
import { ClassConfig, Student } from '../types';
import { soundEngine } from '../utils/soundEngine';

interface HeaderProps {
  config: ClassConfig;
  students: Student[];
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onToggleMobileMenu: () => void;
  onWeeklySummary: () => void;
  onCallStudent: () => void;
  onOpenScoreModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  students,
  onToggleSound,
  onOpenSettings,
  onToggleFullscreen,
  isFullscreen,
  onToggleMobileMenu,
  onWeeklySummary,
  onCallStudent,
  onOpenScoreModal
}) => {
  return (
    <header id="app-main-header" className="bg-[#5B0E0E] text-white shadow-md border-b-2 border-amber-400/80 sticky top-0 z-30 font-sans">
      <div className="w-full px-3.5 sm:px-6 py-2.5">
        <div className="flex flex-col xl:flex-row items-center justify-between gap-3">
          {/* Left info */}
          <div className="flex items-center gap-3 w-full xl:w-auto justify-between xl:justify-start">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onToggleMobileMenu}
                className="lg:hidden p-2 rounded-xl bg-amber-500/25 hover:bg-amber-500/40 text-amber-200 border border-amber-400/40 transition-colors cursor-pointer"
                title="Mở menu danh mục"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold tracking-normal font-serif text-[#fff8db] drop-shadow-sm">
                    {config.className || "Lớp Học Trạng Nguyên"}
                  </h1>
                  {config.topic && (
                    <span className="hidden md:inline-block bg-amber-400/20 text-amber-200 border border-amber-300/30 text-[11px] px-2 py-0.5 rounded-full font-medium font-sans truncate max-w-xs">
                      {config.topic}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-amber-200/90 font-medium font-sans mt-0.5">
                  <span className="flex items-center gap-1">
                    <School className="w-3.5 h-3.5 opacity-80 text-amber-300" />
                    <span>{config.schoolName}</span>
                  </span>
                  <span className="opacity-50">•</span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 opacity-80 text-amber-300" />
                    <span>GV: {config.teacherName}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-center xl:justify-end w-full xl:w-auto">
            {/* Chốt Tuần */}
            <button
              id="btn-header-weekly-summary"
              type="button"
              onClick={onWeeklySummary}
              className="border border-yellow-400 text-yellow-300 bg-transparent hover:bg-yellow-400/15 rounded-xl font-bold font-sans text-xs sm:text-sm px-3.5 py-2 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Tổng kết và vinh danh tuần"
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>Chốt Tuần</span>
            </button>

            {/* Gọi Môn Sinh F2 */}
            <button
              id="btn-header-call-student"
              type="button"
              onClick={onCallStudent}
              className="bg-yellow-400 hover:bg-yellow-300 text-red-900 font-bold font-sans text-xs sm:text-sm rounded-xl px-3.5 py-2 flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer border border-yellow-300"
              title="Vòng quay may mắn / Gọi ngẫu nhiên môn sinh (Phím F2)"
            >
              <Dice5 className="w-4 h-4 text-red-900" />
              <span>Gọi Môn Sinh (F2)</span>
            </button>

            {/* Chấm Điểm */}
            <button
              id="btn-header-grade-score"
              type="button"
              onClick={onOpenScoreModal}
              className="bg-red-600 hover:bg-red-700 text-white font-bold font-sans text-xs sm:text-sm rounded-xl px-3.5 py-2 flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer border border-red-500"
              title="Khen thưởng & Ghi nhận điểm số học sinh"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Chấm Điểm</span>
            </button>

            {/* Sound Toggle */}
            <button
              id="btn-toggle-sound"
              onClick={onToggleSound}
              className={`p-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                config.soundEnabled
                  ? "bg-amber-500/30 text-amber-200 hover:bg-amber-500/50 border border-amber-400/40"
                  : "bg-red-950/40 text-red-300 hover:bg-red-950/60 border border-red-500/30"
              }`}
              title={config.soundEnabled ? "Tắt âm thanh lớp học" : "Bật âm thanh lớp học"}
            >
              {config.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-amber-300" />
              ) : (
                <VolumeX className="w-4 h-4 text-red-300" />
              )}
            </button>

            {/* Fullscreen TV Mode */}
            <button
              id="btn-toggle-fullscreen"
              onClick={onToggleFullscreen}
              className={`p-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                isFullscreen 
                  ? "bg-amber-400 text-amber-950 border border-yellow-300 font-bold" 
                  : "bg-amber-500/30 text-amber-200 hover:bg-amber-500/50 border border-amber-400/40"
              }`}
              title="Trình chiếu toàn màn hình TV / Máy chiếu"
            >
              <Tv className="w-4 h-4" />
              <span className="hidden md:inline font-bold">Trình Chiếu TV</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
