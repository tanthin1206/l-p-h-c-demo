import React from 'react';
import {
  GraduationCap,
  CalendarCheck,
  Award,
  Users2,
  Gamepad2,
  BarChart3,
  Settings,
  Crown,
  X,
  PanelLeftClose
} from 'lucide-react';
import { ActiveTab, ClassConfig } from '../types';

interface SidebarNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  todayAbsentCount: number;
  config: ClassConfig;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

type NavItem = {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Lớp học',
    items: [
      { id: 'students', label: 'Học Sinh & Điểm', icon: GraduationCap },
      { id: 'attendance', label: 'Điểm Danh', icon: CalendarCheck },
    ],
  },
  {
    title: 'Thi đua & Vinh danh',
    items: [
      { id: 'groups', label: 'Thi Đua Tổ', icon: Users2 },
      { id: 'honor', label: 'Bảng Vàng', icon: Award },
      { id: 'games', label: 'Trò Chơi', icon: Gamepad2 },
    ],
  },
  {
    title: 'Quản lý',
    items: [
      { id: 'reports', label: 'Báo Cáo & AI', icon: BarChart3 },
      { id: 'settings', label: 'Cài Đặt', icon: Settings },
    ],
  },
];

export const NAV_LABELS: Record<ActiveTab, string> = NAV_SECTIONS.flatMap(s => s.items).reduce(
  (acc, it) => ({ ...acc, [it.id]: it.label }),
  {} as Record<ActiveTab, string>
);

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onTabChange,
  todayAbsentCount,
  config,
  isMobileOpen = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const handleSelectTab = (tab: ActiveTab) => {
    onTabChange(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const badgeFor = (id: ActiveTab) =>
    id === 'attendance' && todayAbsentCount > 0 ? `${todayAbsentCount} vắng` : null;

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-primary-950/60 backdrop-blur-[2px] z-40 lg:hidden animate-fade-in"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="app-sidebar-nav"
        className={`
          fixed top-0 bottom-0 left-0 z-40 lg:z-30
          w-[250px] h-screen
          bg-gradient-to-b from-primary-900 via-primary-900 to-primary-950 text-white
          border-r border-gold-500/25 shadow-2xl
          flex flex-col
          transition-transform duration-300 ease-in-out select-none
          ${isMobileOpen ? 'translate-x-0 !z-50' : isCollapsed ? '-translate-x-full' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-gold-500/20 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-200 via-gold-400 to-gold-600 flex items-center justify-center shadow-md ring-1 ring-gold-200/60 shrink-0">
              <Crown className="w-5 h-5 text-primary-900 fill-gold-200" />
            </div>
            <div className="min-w-0 leading-tight">
              <div className="text-[15px] font-black font-serif text-gold-100 truncate">Trạng Nguyên Nhí</div>
              <div className="text-[10px] font-bold text-gold-400/90 tracking-[0.2em] uppercase">Đất Việt</div>
            </div>
          </div>

          <div className="flex items-center shrink-0">
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-lg text-gold-200/70 hover:text-gold-100 hover:bg-white/10 transition-colors cursor-pointer"
                title="Ẩn thanh menu"
              >
                <PanelLeftClose className="w-[18px] h-[18px]" />
              </button>
            )}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg text-gold-200 hover:bg-white/10 cursor-pointer"
                title="Đóng menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-none">
          {NAV_SECTIONS.map(section => (
            <div key={section.title}>
              <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-gold-400/60">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const badge = badgeFor(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${
                        isActive
                          ? 'bg-gradient-to-r from-gold-300 to-gold-400 text-primary-950 shadow-md font-bold'
                          : 'text-gold-50/80 hover:bg-white/[0.07] hover:text-white'
                      }`}
                    >
                      <Icon
                        className={`w-[18px] h-[18px] shrink-0 ${
                          isActive ? 'text-primary-900' : 'text-gold-400/80 group-hover:text-gold-300'
                        }`}
                      />
                      <span className="truncate flex-1">{item.label}</span>
                      {badge && (
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-black shrink-0 ${
                            isActive ? 'bg-primary-900 text-gold-200' : 'bg-gold-400 text-primary-950'
                          }`}
                        >
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="m-3 p-3 rounded-2xl bg-white/[0.06] border border-gold-500/15 shrink-0">
          <div className="text-[10px] uppercase tracking-widest text-gold-400/70 font-bold">Lớp chủ nhiệm</div>
          <div className="text-sm font-black font-serif text-gold-100 truncate">{config.className}</div>
          <div className="text-[11px] text-gold-50/60 truncate">{config.schoolName}</div>
        </div>
      </aside>
    </>
  );
};
