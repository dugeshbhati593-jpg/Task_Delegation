import { Task, User } from "@/src/types";
import { Badge } from "./Badge";
import { MoreVertical, Calendar, User as UserIcon, Trash2, Edit2, ListTodo, Clock, Bell, MessageSquare, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/src/lib/utils";

interface TaskListProps {
  tasks: Task[];
  users: User[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: Task['status']) => void;
}

export function TaskList({ tasks, users, onEdit, onDelete, onStatusChange }: TaskListProps) {
  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const filteredTasks = tasks.filter(t => t.type === 'task' || !t.type); // Handle legacy tasks too

  // Calculate team performance
  const teamPerformance = users.map(user => {
    const userTasks = filteredTasks.filter(t => t.assignee_id === user.id);
    const total = userTasks.length;
    const pending = userTasks.filter(t => t.status === 'todo' || t.status === 'in-progress').length;
    const overdue = userTasks.filter(t => t.status === 'overdue').length;
    const completed = userTasks.filter(t => t.status === 'completed').length;
    
    return {
      ...user,
      total,
      pending,
      overdue,
      completed,
      averageDelay: 'N/A' // Cannot calculate without completed_at timestamp
    };
  });

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Team Performance Overview Table */}
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/40 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Team Performance Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200/60">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name & Role</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Total Tasks</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Pending/In Progress</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Overdue Tasks</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Completed (On Time)</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Average Delay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {teamPerformance.map((member) => (
                <tr key={member.id} className="hover:bg-white/50 transition-all">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                        {getInitials(member.name)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{member.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{member.designation || 'Member'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-center text-sm font-bold text-slate-600">{member.total}</td>
                  <td className="px-8 py-4 text-center text-sm font-bold text-blue-600">{member.pending}</td>
                  <td className="px-8 py-4 text-center text-sm font-bold text-rose-600">{member.overdue}</td>
                  <td className="px-8 py-4 text-center text-sm font-bold text-emerald-600">{member.completed}</td>
                  <td className="px-8 py-4 text-center text-sm font-bold text-slate-400">{member.averageDelay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task List (Card Format) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-white/70 backdrop-blur-sm p-6 rounded-3xl border border-white/40 shadow-sm hover:shadow-md transition-all group relative">
            {/* Actions */}
            <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
              <button 
                onClick={() => onEdit(task)}
                className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                title="Edit Task"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onDelete(task.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <h3 className="text-base font-bold text-slate-800 pr-20">{task.title}</h3>

              {/* To / From */}
              <div className="space-y-0.5">
                <p className="text-[11px] font-medium text-slate-700">To: <span className="font-bold">{task.assignee_name || 'Unassigned'}</span></p>
                <p className="text-[11px] font-medium text-slate-500">From: <span className="font-bold text-slate-700">{task.creator_name || 'Admin'}</span></p>
              </div>

              {/* Initials */}
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-brand-500/20">
                {getInitials(task.assignee_name)}
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 leading-relaxed">
                {task.description || 'No description provided.'}
              </p>

              {/* Status & Reminders */}
              <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                  <Bell className="w-3 h-3" />
                  <span>Reminders {task.reminders_enabled ? 'ON' : 'OFF'}</span>
                </div>
                
                <div className="relative w-max">
                  <select 
                    value={task.status}
                    onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
                    className={cn(
                      "appearance-none rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-widest cursor-pointer pr-6 focus:outline-none",
                      task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      task.status === 'overdue' ? 'bg-rose-100 text-rose-700' :
                      'bg-slate-100 text-slate-700'
                    )}
                  >
                    <option value="todo">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                  </select>
                  <MoreVertical className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-current opacity-50 pointer-events-none" />
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  <Clock className="w-3 h-3" />
                  <span>Due: {task.deadline ? format(new Date(task.deadline), 'MMM d, yyyy, hh:mm a') : 'No date'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white/50 rounded-3xl border border-white/40 border-dashed">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                <ListTodo className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-500">No tasks found</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
