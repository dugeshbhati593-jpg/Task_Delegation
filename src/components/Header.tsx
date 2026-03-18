import { Search, Plus, Filter } from "lucide-react";

interface HeaderProps {
  title: string;
  onAddTask: () => void;
  activeTab: string;
}

export function Header({ title, onAddTask, activeTab }: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search tasks, people..." 
            className="pl-10 pr-4 py-2 bg-slate-100/50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 w-48 lg:w-80 transition-all placeholder:text-slate-400"
          />
        </div>
        
        <button className="p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-xl border border-slate-200/60 transition-all active:scale-95">
          <Filter className="w-4 h-4" />
        </button>

        {activeTab === 'tasks' && (
          <button 
            onClick={onAddTask}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-500/25 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        )}
      </div>
    </header>
  );
}
