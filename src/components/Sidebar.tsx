import { LayoutDashboard, ListTodo, Users, Bell, Calendar, LayoutGrid, List, LogOut, User as UserIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useState } from "react";
import { User } from "@/src/types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  viewMode: 'list' | 'kanban';
  setViewMode: (mode: 'list' | 'kanban') => void;
  currentUser: User;
  onLogout: () => void;
  onOpenProfile: () => void;
}

export function Sidebar({ activeTab, setActiveTab, viewMode, setViewMode, currentUser, onLogout, onOpenProfile }: SidebarProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, counter: 0 },
    { id: 'tasks', label: 'Tasks and Projects', icon: ListTodo, counter: 5 },
    { id: 'calendar', label: 'Calendar', icon: Calendar, counter: 0 },
  ];

  const collaborationItems = [
    { id: 'team', label: 'Employees', icon: Users, counter: 0 },
    { id: 'notifications', label: 'Feed', icon: Bell, counter: 2 },
  ];

  return (
    <aside className="w-64 bg-slate-900/95 backdrop-blur-xl text-slate-300 h-screen sticky top-0 flex flex-col z-20 border-r border-white/5">
      <div className="h-16 flex items-center px-6 gap-3 border-b border-white/5">
        <div className="flex items-center gap-2 group cursor-pointer">
          <img 
            src="https://www.ginzalimited.com/cdn/shop/files/Ginza_logo.jpg?v=1668509673&width=500" 
            alt="GINZA Logo" 
            className="w-8 h-8 rounded-lg object-cover bg-white group-hover:scale-110 transition-transform"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white leading-none">Ginza Industries Ltd.</span>
          </div>
        </div>
      </div>

      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                  isActive 
                    ? "bg-white/10 text-white shadow-sm" 
                    : "hover:bg-white/5 hover:text-white text-slate-400"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    isActive ? "bg-brand-500 text-white" : "bg-slate-800 text-slate-500 group-hover:text-slate-300"
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.counter > 0 && (
                  <span className="bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                    {item.counter}
                  </span>
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-brand-500 rounded-r-full" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="space-y-1">
          <div className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Collaboration
          </div>
          
          {collaborationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                  isActive 
                    ? "bg-white/10 text-white shadow-sm" 
                    : "hover:bg-white/5 hover:text-white text-slate-400"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    isActive ? "bg-brand-500 text-white" : "bg-slate-800 text-slate-500 group-hover:text-slate-300"
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.counter > 0 && (
                  <span className="bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                    {item.counter}
                  </span>
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-brand-500 rounded-r-full" />
                )}
              </button>
            );
          })}
        </div>

        {activeTab === 'tasks' && (
          <div className="space-y-3 pt-4 border-t border-white/5">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">View Mode</p>
            <div className="flex p-1 bg-slate-800/50 rounded-xl border border-white/5">
              <button 
                onClick={() => setViewMode('list')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                  viewMode === 'list' ? "bg-slate-700 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                )}
              >
                <List className="w-3.5 h-3.5" />
                List
              </button>
              <button 
                onClick={() => setViewMode('kanban')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                  viewMode === 'kanban' ? "bg-slate-700 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Kanban
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 mt-auto border-t border-white/5 space-y-4 relative">
        {isProfileMenuOpen && (
          <div className="absolute bottom-[80px] left-4 right-4 bg-slate-800 border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 animate-in slide-in-from-bottom-2">
            <button 
              onClick={() => {
                setIsProfileMenuOpen(false);
                onOpenProfile();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-left"
            >
              <UserIcon className="w-4 h-4" />
              Profile
            </button>
            <div className="h-px bg-white/10" />
            <button 
              onClick={() => {
                setIsProfileMenuOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}

        <div 
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 group cursor-pointer hover:bg-white/10 transition-colors"
        >
          <div className="relative">
            <img 
              src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} 
              alt={currentUser.name} 
              className="w-10 h-10 rounded-full bg-slate-700 border-2 border-brand-500 group-hover:scale-105 transition-transform object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
            <p className="text-[10px] text-slate-500 truncate uppercase tracking-tighter font-bold">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

