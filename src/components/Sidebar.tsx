import React from 'react';
import {
  Church, ShieldCheck, UserPlus, Home, LogOut,
  Users, Palette, Building2, GraduationCap, LayoutDashboard
} from 'lucide-react';

export type MainNavTab = 'landing' | 'register' | 'admin';
export type AdminView = 'dashboard' | 'students' | 'admins' | 'denominations' | 'reference';

interface SidebarProps {
  currentTab: MainNavTab;
  adminView: AdminView;
  onChangeTab: (tab: MainNavTab) => void;
  onChangeAdminView: (view: AdminView) => void;
  totalStudentsCount: number;
  isAdmin: boolean;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  adminView,
  onChangeTab,
  onChangeAdminView,
  totalStudentsCount,
  isAdmin,
  onLogout
}) => {
  const publicNav: { key: MainNavTab; label: string; icon: React.ReactNode }[] = [
    { key: 'landing', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { key: 'register', label: 'Registration', icon: <UserPlus className="w-4 h-4" /> },
  ];

  const adminNav: { key: AdminView; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'students', label: 'Students', icon: <Users className="w-4 h-4" />, badge: totalStudentsCount },
    { key: 'admins', label: 'Admins & Reps', icon: <ShieldCheck className="w-4 h-4" /> },
    { key: 'denominations', label: 'Denominations', icon: <Palette className="w-4 h-4" /> },
    { key: 'reference', label: 'Hostels & Courses', icon: <Building2 className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-60 lg:w-64 shrink-0 bg-[#141414] text-white flex flex-col min-h-screen sticky top-0">
      {/* Brand */}
      <button
        onClick={() => onChangeTab('landing')}
        className="p-5 text-left border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-[#f5e11d] shrink-0">
            <Church className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="font-heading text-lg font-semibold tracking-tight text-white block leading-tight">
              SCC
            </span>
            <span className="text-[10px] uppercase tracking-[0.1em] text-[#f5e11d] font-semibold block">
              Admin Portal
            </span>
          </div>
        </div>
      </button>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {isAdmin ? (
          <>
            <div className="text-[10px] uppercase tracking-wider text-white/30 font-semibold px-3.5 pt-2 pb-1">
              Management
            </div>
            {adminNav.map((item) => {
              const isActive = currentTab === 'admin' && adminView === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    onChangeTab('admin');
                    onChangeAdminView(item.key);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white/12 text-white shadow-sm border border-white/10'
                      : 'text-white/60 hover:text-white hover:bg-white/6'
                  }`}
                >
                  <span className={isActive ? 'text-[#f5e11d]' : 'text-white/40'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-auto text-[10px] font-mono font-bold bg-[#f5e11d]/20 text-[#f5e11d] px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </>
        ) : (
          <>
            <div className="text-[10px] uppercase tracking-wider text-white/30 font-semibold px-3.5 pt-2 pb-1">
              Navigate
            </div>
            {publicNav.map((item) => {
              const isActive = currentTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onChangeTab(item.key)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white/12 text-white shadow-sm border border-white/10'
                      : 'text-white/60 hover:text-white hover:bg-white/6'
                  }`}
                >
                  <span className={isActive ? 'text-[#f5e11d]' : 'text-white/40'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-3">
        {isAdmin ? (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white/50 hover:text-[#FF8A80] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        ) : (
          <div className="text-[11px] text-white/30 text-center leading-relaxed">
            Connecting fresh students<br />to fellowship & pastoral care.
          </div>
        )}
        <div className="text-[10px] text-white/20 text-center">
          Student Christian Council
        </div>
      </div>
    </aside>
  );
};
