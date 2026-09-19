import React from 'react';
import { 
  GraduationCap, 
  CalendarCheck, 
  Award, 
  Users2, 
  BookOpen, 
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
  pendingAssignmentsCount: number;
  config: ClassConfig;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onTabChange,
  todayAbsentCount,
  pendingAssignmentsCount,
  config,
  isMobileOpen = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge: string | null;
    badgeColor: string;
  }[] = [
    { id: "students", label: "Học Sinh & Điểm", icon: GraduationCap, badge: null, badgeColor: "" },
    { id: "attendance", label: "Điểm Danh", icon: CalendarCheck, badge: todayAbsentCount > 0 ? `${todayAbsentCount} vắng` : null, badgeColor: "bg-amber-400 text-red-950 font-bold" },
    { id: "honor", label: "Bảng Vàng & Vinh Danh", icon: Award, badge: "Vinh danh", badgeColor: "bg-amber-400 text-amber-950 font-black" },
    { id: "groups", label: "Thi Đua Tổ", icon: Users2, badge: null, badgeColor: "" },
    { id: "assignments", label: "Giao Bài Tập", icon: BookOpen, badge: pendingAssignmentsCount > 0 ? `${pendingAssignmentsCount} bài` : null, badgeColor: "bg-amber-300 text-amber-950 font-bold" },
    { id: "games", label: "Trò Chơi Trạng Nguyên", icon: Gamepad2, badge: "Vui nhộn", badgeColor: "bg-rose-400 text-white font-bold" },
    { id: "reports", label: "Báo Cáo & AI", icon: BarChart3, badge: "AI 3.7", badgeColor: "bg-amber-300 text-amber-950 font-bold" },
    { id: "settings", label: "Cài Đặt Hệ Thống", icon: Settings, badge: null, badgeColor: "" },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    onTabChange(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar */}
      <aside
        id="app-sidebar-nav"
        className={`
          fixed top-0 bottom-0 left-0 z-40 lg:z-30
          w-[250px] min-w-[250px] max-w-[250px] h-screen
          bg-[#5B0E0E] text-white
          border-r-2 border-amber-500/30 shadow-2xl
          flex flex-col justify-between
          transition-transform duration-300 ease-in-out select-none
          ${isMobileOpen ? "translate-x-0 !z-50" : isCollapsed ? "-translate-x-full" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Top Header Logo & Nav Items */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="p-4 border-b border-amber-500/20 bg-black/15 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 text-amber-950 flex items-center justify-center shadow-lg border border-amber-200 shrink-0 transform hover:scale-105 transition-transform">
                  <Crown className="w-6 h-6 text-amber-950 fill-yellow-300" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base font-black tracking-tight font-serif text-amber-200 leading-tight drop-shadow-sm truncate">
                    Trạng Nguyên Nhí
                  </h1>
                  <div className="text-[11px] font-semibold text-amber-300/90 font-sans tracking-wide uppercase">
                    Đất Việt
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Desktop Collapse Button */}
                {onToggleCollapse && (
                  <button
                    type="button"
                    onClick={onToggleCollapse}
                    className="hidden lg:flex p-1.5 rounded-lg text-amber-200/80 hover:text-amber-100 hover:bg-white/10 transition-colors cursor-pointer"
                    title="Thu gọn menu (Ẩn thanh bên)"
                  >
                    <PanelLeftClose className="w-5 h-5" />
                  </button>
                )}

                {/* Mobile Close Button */}
                {onCloseMobile && (
                  <button
                    type="button"
                    onClick={onCloseMobile}
                    className="lg:hidden p-1.5 rounded-lg text-amber-200 hover:bg-white/10 cursor-pointer"
                    title="Đóng menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1.5 overflow-y-auto flex-1 scrollbar-thin font-sans">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 shadow-md scale-[1.02]'
                      : 'text-amber-100/85 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-950' : 'text-amber-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase shrink-0 shadow-xs ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Footer */}
        <div className="p-3 border-t border-amber-500/20 bg-black/20 text-center text-xs text-amber-200/70 font-serif shrink-0">
          <div className="font-bold text-amber-200">{config.className}</div>
          <div className="text-[11px] truncate">{config.schoolName}</div>
        </div>
      </aside>
    </>
  );
};
