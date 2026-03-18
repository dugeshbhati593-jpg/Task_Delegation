import { Task, Status } from "@/src/types";
import { Badge } from "./Badge";
import { MoreHorizontal, Plus, Calendar, CheckSquare } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion } from "motion/react";

interface KanbanBoardProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onStatusChange: (id: number, status: Status) => void;
}

const COLUMNS: { id: Status; label: string; color: string; accent: string }[] = [
  { id: 'todo', label: 'To Do', color: 'bg-slate-100/40', accent: 'border-slate-400' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-blue-50/40', accent: 'border-blue-400' },
  { id: 'completed', label: 'Completed', color: 'bg-emerald-50/40', accent: 'border-emerald-400' },
  { id: 'overdue', label: 'Overdue', color: 'bg-rose-50/40', accent: 'border-rose-400' },
];

export function KanbanBoard({ tasks, onEdit, onStatusChange }: KanbanBoardProps) {
  const filteredTasks = tasks.filter(t => t.type === 'task' || !t.type);

  return (
    <div className="p-8 h-[calc(100vh-64px)] overflow-x-auto custom-scrollbar">
      <div className="flex gap-8 h-full min-w-max">
        {COLUMNS.map((column) => (
          <div key={column.id} className="w-80 flex flex-col gap-6">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <div className={cn("w-2 h-2 rounded-full border-2", column.accent)} />
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-widest">{column.label}</h3>
                <span className="bg-white/50 backdrop-blur-sm text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-white/40 shadow-sm">
                  {filteredTasks.filter(t => t.status === column.id).length}
                </span>
              </div>
              <button className="p-1.5 hover:bg-white/50 rounded-lg text-slate-400 transition-all active:scale-90">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className={cn("flex-1 rounded-3xl p-4 space-y-4 overflow-y-auto backdrop-blur-sm border border-white/40 shadow-inner", column.color)}>
              {filteredTasks
                .filter((t) => t.status === column.id)
                .map((task) => (
                  <motion.div
                    layout
                    key={task.id}
                    onClick={() => onEdit(task)}
                    className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-white/60 cursor-pointer hover:shadow-xl hover:shadow-brand-500/5 hover:border-brand-200 transition-all group active:scale-[0.98]"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <Badge type="priority" value={task.priority} className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg" />
                      <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-100 rounded-lg transition-all text-slate-400">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-slate-800 mb-3 line-clamp-2 leading-relaxed group-hover:text-brand-600 transition-colors">{task.title}</h4>
                    
                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {task.tags.map(tag => (
                          <span key={tag} className="text-[9px] font-bold bg-slate-100/80 text-slate-500 px-2 py-0.5 rounded-lg uppercase tracking-wider border border-white">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100/60">
                      <div className="flex items-center gap-4 text-slate-400">
                        {task.deadline && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                            <Calendar className="w-3.5 h-3.5 text-slate-300" />
                            {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                        {task.checklist.length > 0 && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                            <CheckSquare className="w-3.5 h-3.5 text-slate-300" />
                            {task.checklist.filter(i => i.completed).length}/{task.checklist.length}
                          </div>
                        )}
                      </div>

                      <div className="w-8 h-8 rounded-xl bg-slate-100/80 flex items-center justify-center border border-white shadow-sm group-hover:scale-110 transition-transform">
                        <img 
                          src={task.assignee_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${task.id}`} 
                          alt={task.assignee_name || ''} 
                          className="w-7 h-7 rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              
              <button className="w-full py-4 flex items-center justify-center gap-2 text-slate-400 hover:text-brand-600 hover:bg-white/80 hover:border-brand-200 rounded-2xl border-2 border-dashed border-slate-200/60 transition-all text-xs font-bold uppercase tracking-widest active:scale-95">
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
