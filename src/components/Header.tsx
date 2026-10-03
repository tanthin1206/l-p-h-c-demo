import React from 'react';
import {
  Menu,
  Volume2,
  VolumeX,
  Tv,
  Sparkles,
  Trophy,
  RotateCw,
  PanelLeftOpen,
  Minimize2
} from 'lucide-react';
import { ClassConfig, Student } from '../types';

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
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  title?: string;
}

const iconBtn =
  'w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border';

export const Header: React.FC<HeaderProps> = ({
  config,
  onToggleSound,
  onToggleFullscreen,
  isFullscreen,
  onToggleMobileMenu,
  onWeeklySummary,
  onCallStudent,
  onOpenScoreModal,
  isSidebarCollapsed = false,
  onToggleSidebar,
  title
}) => {
  return (
    <header
      id="app-main-header"
      className="sticky top-0 z-30 font-sans bg-primary-900/95 backdrop-blur supports-[backdrop-filter]:bg-primary-900/90 text-white border-b border-gold-500/40 shadow-[0_4px_20px_-8px_rgba(58,8,7,0.6)]"
    >
      <div className="w-full px-3 sm:px-5 h-14 flex items-center gap-2 sm:gap-3">
        {/* Left: menu toggles + title */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className={`${iconBtn} lg:hidden bg-white/5 border-white/10 text-gold-200 hover:bg-white/10`}
          title="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {onToggleSidebar && isSidebarCollapsed && (
          <button
            type="button"
            id="btn-toggle-desktop-sidebar"
            onClick={onToggleSidebar}
            className={`${iconBtn} hidden lg:flex bg-white/5 border-white/10 text-gold-200 hover:bg-white/10`}
            title="Hiện thanh menu"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        )}

        <div className="min-w-0 hidden sm:block">
          <div className="text-[10px] uppercase tracking-[0.18em] text-gold-300/80 font-bold leading-none">
            {config.className}
          </div>
          <div className="text-sm font-black font-serif text-gold-100 truncate leading-tight mt-0.5">
            {title || config.schoolName}
          </div>
        </div>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button
            id="btn-header-weekly-summary"
            type="button"
            onClick={onWeeklySummary}
            className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold border border-gold-400/50 text-gold-200 hover:bg-gold-400/10 transition-all cursor-pointer"
            title="Tổng kết và vinh danh tuần"
          >
            <Trophy className="w-4 h-4" />
            <span>Chốt Tuần</span>
          </button>

          <button
            id="btn-header-call-student"
            type="button"
            onClick={onCallStudent}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-black bg-gradient-to-b from-gold-300 to-gold-500 hover:from-gold-200 hover:to-gold-400 text-primary-950 shadow-sm active:scale-95 transition-all cursor-pointer"
            title="Vòng quay may mắn gọi môn sinh (F2)"
          >
            <RotateCw className="w-4 h-4" />
            <span className="hidden sm:inline">Gọi Môn Sinh</span>
            <kbd className="hidden lg:inline text-[10px] font-bold px-1 rounded bg-primary-950/15">F2</kbd>
          </button>

          <button
            id="btn-header-grade-score"
            type="button"
            onClick={onOpenScoreModal}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-black bg-primary-600 hover:bg-primary-500 text-white border border-primary-400/40 shadow-sm active:scale-95 transition-all cursor-pointer"
            title="Khen thưởng & nhắc nhở học sinh"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Chấm Điểm</span>
          </button>

          <div className="w-px h-6 bg-white/15 mx-0.5 hidden sm:block" />

          <button
            id="btn-toggle-sound"
            onClick={onToggleSound}
            className={`${iconBtn} ${
              config.soundEnabled
                ? 'bg-white/5 border-white/10 text-gold-200 hover:bg-white/10'
                : 'bg-primary-950/50 border-primary-500/30 text-primary-300 hover:bg-primary-950/70'
            }`}
            title={config.soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {config.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            id="btn-toggle-fullscreen"
            onClick={onToggleFullscreen}
            className={`inline-flex items-center gap-1.5 h-9 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isFullscreen
                ? 'bg-gold-400 text-primary-950 border-gold-300'
                : 'bg-white/5 border-white/10 text-gold-200 hover:bg-white/10'
            }`}
            title={isFullscreen ? 'Thoát chế độ trình chiếu' : 'Trình chiếu lên TV / máy chiếu (chữ to, toàn màn hình)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
            <span className="hidden md:inline">{isFullscreen ? 'Thoát trình chiếu' : 'Trình chiếu'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
