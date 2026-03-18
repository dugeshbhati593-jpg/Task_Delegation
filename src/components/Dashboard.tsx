import { useState } from "react";
import { Task, User } from "@/src/types";
import { CheckCircle2, Clock, AlertCircle, ListTodo, MoreVertical, Calendar, ChevronDown, ChevronUp, MessageSquare, Bell, MapPin, Paperclip } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { format } from "date-fns";
import { Badge } from "./Badge";

interface DashboardProps {
  tasks: Task[];
  users: User[];
}

export function Dashboard({ tasks, users }: DashboardProps) {
  const [isTasksCollapsed, setIsTasksCollapsed] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all');
  const [memberFilter, setMemberFilter] = useState<'all' | 'me'>('all');

  const tasksOnly = tasks.filter(t => t.type === 'task' || !t.type);

  const stats = [
    { 
      label: 'Total Tasks', 
      value: tasksOnly.length, 
      icon: ListTodo, 
      color: 'text-slate-600', 
      bg: 'bg-slate-100/80' 
    },
    { 
      label: 'Ongoing', 
      value: tasksOnly.filter(t => t.status === 'in-progress').length, 
      icon: Clock, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100/80' 
    },
    { 
      label: 'Completed', 
      value: tasksOnly.filter(t => t.status === 'completed').length, 
      icon: CheckCircle2, 
      color: 'text-green-600', 
      bg: 'bg-green-100/80' 
    },
    { 
      label: 'Overdue', 
      value: tasksOnly.filter(t => t.status === 'overdue').length, 
      icon: AlertCircle, 
      color: 'text-rose-600', 
      bg: 'bg-rose-100/80' 
    },
  ];

  const filteredTasks = tasksOnly.filter(task => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    return true;
  });

  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Calculate team performance
  const teamPerformance = users.map(user => {
    const userTasks = tasksOnly.filter(t => t.assignee_id === user.id);
    const total = userTasks.length;
    const completed = userTasks.filter(t => t.status === 'completed').length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return {
      ...user,
      total,
      completed,
      percentage
    };
  });

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/40 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-2">
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Tasks List Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 shadow-sm overflow-hidden">
            <div 
              className="px-6 py-4 flex items-center justify-between border-b border-slate-100 cursor-pointer hover:bg-slate-50/50 transition-colors"
              onClick={() => setIsTasksCollapsed(!isTasksCollapsed)}
            >
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-slate-800 tracking-tight">Tasks List</h3>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold">{filteredTasks.length}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <select 
                    value={memberFilter}
                    onChange={(e) => setMemberFilter(e.target.value as any)}
                    className="text-[10px] font-bold text-slate-500 bg-transparent border-none focus:ring-0 cursor-pointer uppercase tracking-widest"
                  >
                    <option value="all">All Members</option>
                    <option value="me">Only Me</option>
                  </select>
                  <div className="h-3 w-[1px] bg-slate-200 mx-1" />
                  <div className="flex gap-2">
                    {(['all', 'todo', 'in-progress', 'completed'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-widest transition-colors",
                          statusFilter === s ? "text-brand-600" : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {s === 'todo' ? 'Pending' : s}
                      </button>
                    ))}
                  </div>
                </div>
                {isTasksCollapsed ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronUp className="w-5 h-5 text-slate-400" />}
              </div>
            </div>

            {!isTasksCollapsed && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTasks.slice(0, 10).map((task) => (
                    <div key={task.id} className="bg-white/70 backdrop-blur-sm p-5 rounded-2xl border border-white/40 shadow-sm hover:shadow-md transition-all group relative">
                      <div className="space-y-3">
                        {/* Title */}
                        <h3 className="text-sm font-bold text-slate-800 pr-8">{task.title}</h3>

                        {/* To / From */}
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-medium text-slate-700">To: <span className="font-bold">{task.assignee_name || 'Unassigned'}</span></p>
                          <p className="text-[10px] font-medium text-slate-500">From: <span className="font-bold text-slate-700">{task.creator_name || 'Admin'}</span></p>
                        </div>

                        {/* Initials */}
                        <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-brand-500/20">
                          {getInitials(task.assignee_name)}
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {task.description || 'No description provided.'}
                        </p>

                        {/* Status & Reminders */}
                        <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-1 text-[9px] font-bold text-blue-500 uppercase tracking-widest">
                            <Bell className="w-3 h-3" />
                            <span>Reminders {task.reminders_enabled ? 'ON' : 'OFF'}</span>
                          </div>
                          
                          <div className={cn(
                            "rounded-lg px-2 py-1 text-[9px] font-bold uppercase tracking-widest w-max",
                            task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                            task.status === 'overdue' ? 'bg-rose-100 text-rose-700' :
                            'bg-slate-100 text-slate-700'
                          )}>
                            {task.status === 'todo' ? 'Pending' : task.status}
                          </div>

                          <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                            <Clock className="w-3 h-3" />
                            <span>Due: {task.deadline ? format(new Date(task.deadline), 'MMM d, yyyy, hh:mm a') : 'No date'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredTasks.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-white/50 rounded-2xl border border-white/40 border-dashed">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                          <ListTodo className="w-5 h-5 text-slate-400" />
                        </div>
                        <p className="text-xs font-bold text-slate-500">No tasks found</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Team Performance Section */}
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/40 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-slate-800 tracking-tight">Team Performance</h3>
            </div>
            <div className="space-y-4">
              {teamPerformance.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {getInitials(member.name)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{member.name}</h4>
                      <p className="text-[11px] font-medium text-slate-500">{member.completed} / {member.total} tasks completed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-brand-600">{member.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
