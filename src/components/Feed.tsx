import { Task, User } from "@/src/types";
import { format } from "date-fns";
import { Bell, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface FeedProps {
  tasks: Task[];
  users: User[];
  currentUser: User;
}

export function Feed({ tasks, users, currentUser }: FeedProps) {
  // Filter tasks that are reminders OR have reminders enabled
  const reminders = tasks
    .filter(t => t.type === 'reminder' || t.reminders_enabled)
    .sort((a, b) => new Date(a.deadline || 0).getTime() - new Date(b.deadline || 0).getTime());

  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Activity Feed</h2>
          <p className="text-sm text-slate-500 mt-1">Your upcoming reminders and tasks</p>
        </div>
        <div className="px-4 py-2 bg-brand-50 text-brand-700 rounded-xl text-sm font-bold flex items-center gap-2">
          <Bell className="w-4 h-4" />
          {reminders.length} Active Reminders
        </div>
      </div>

      <div className="space-y-4">
        {reminders.length === 0 ? (
          <div className="py-20 text-center bg-white/50 rounded-3xl border border-slate-200 border-dashed">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Bell className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">No active reminders</h3>
              <p className="text-sm text-slate-500">Reminders you add will appear here.</p>
            </div>
          </div>
        ) : (
          reminders.map((reminder) => {
            const isOverdue = reminder.deadline && new Date(reminder.deadline) < new Date() && reminder.status !== 'completed';
            
            return (
              <div 
                key={reminder.id} 
                className={cn(
                  "bg-white p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md flex gap-6",
                  isOverdue ? "border-rose-200" : "border-slate-100"
                )}
              >
                <div className="shrink-0 flex flex-col items-center gap-2">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg",
                    isOverdue ? "bg-rose-500 shadow-rose-500/20" : 
                    reminder.status === 'completed' ? "bg-emerald-500 shadow-emerald-500/20" : 
                    "bg-brand-600 shadow-brand-500/20"
                  )}>
                    {isOverdue ? <AlertCircle className="w-6 h-6" /> : 
                     reminder.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : 
                     <Bell className="w-6 h-6" />}
                  </div>
                  <div className="w-[2px] h-full bg-slate-100 rounded-full my-2" />
                </div>

                <div className="flex-1 space-y-4 pb-4">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-bold text-slate-900">{reminder.title}</h3>
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap",
                        reminder.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        reminder.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                        reminder.status === 'overdue' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-100 text-slate-700'
                      )}>
                        {reminder.status === 'todo' ? 'Pending' : reminder.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                      {reminder.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                        {getInitials(reminder.assignee_name)}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned To</p>
                        <p className="text-xs font-bold text-slate-700">{reminder.assignee_name || 'Unassigned'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Date</p>
                        <p className={cn(
                          "text-xs font-bold",
                          isOverdue ? "text-rose-600" : "text-slate-700"
                        )}>
                          {reminder.deadline ? format(new Date(reminder.deadline), 'MMM d, yyyy, hh:mm a') : 'No date set'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
