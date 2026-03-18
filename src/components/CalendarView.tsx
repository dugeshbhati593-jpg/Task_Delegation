import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, Clock, User as UserIcon, Mail } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Task, User } from '@/src/types';
import { Badge } from './Badge';

interface CalendarViewProps {
  tasks: Task[];
  users: User[];
  onAddReminder?: (taskData: any) => void;
}

export function CalendarView({ tasks, users, onAddReminder }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderData, setReminderData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    userId: '',
    email: ''
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleUserSelect = (userId: string) => {
    const selectedUser = users.find(u => u.id.toString() === userId);
    setReminderData({
      ...reminderData,
      userId,
      email: selectedUser ? selectedUser.email : ''
    });
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddReminder) {
      onAddReminder({
        title: reminderData.title,
        description: reminderData.description,
        assignee_id: parseInt(reminderData.userId),
        deadline: `${reminderData.date}T${reminderData.time}`,
        status: 'todo',
        priority: 'medium',
        reminders_enabled: true,
        type: 'reminder'
      });
    }
    setIsReminderModalOpen(false);
    setReminderData({ title: '', description: '', date: '', time: '', userId: '', email: '' });
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/40 shadow-sm flex-1 flex flex-col overflow-hidden relative">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <div className="flex items-center bg-slate-100/80 rounded-xl p-1 border border-white/50">
              <button 
                onClick={prevMonth}
                className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-500 hover:text-brand-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={nextMonth}
                className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-500 hover:text-brand-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors uppercase tracking-widest"
            >
              Today
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsReminderModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20"
            >
              <Plus className="w-4 h-4" />
              Add Reminder
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-7 overflow-auto custom-scrollbar">
          {calendarDays.map((day, idx) => {
            const dayTasks = tasks.filter(task => isSameDay(new Date(task.deadline), day));
            return (
              <div 
                key={idx} 
                className={cn(
                  "min-h-[120px] p-2 border-r border-b border-slate-100 transition-colors hover:bg-slate-50/30",
                  !isSameMonth(day, monthStart) && "bg-slate-50/50 text-slate-300",
                  isSameDay(day, new Date()) && "bg-brand-50/30"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={cn(
                    "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full",
                    isSameDay(day, new Date()) ? "bg-brand-500 text-white" : "text-slate-600"
                  )}>
                    {format(day, 'd')}
                  </span>
                </div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map(task => (
                    <div 
                      key={task.id}
                      className="px-2 py-1 bg-white border border-slate-100 rounded-lg shadow-sm text-[10px] font-medium text-slate-700 truncate hover:border-brand-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-[9px] font-bold text-slate-400 px-2">
                      + {dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Reminder Modal */}
        {isReminderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Add Reminder</h3>
                <button onClick={() => setIsReminderModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSaveReminder} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Task Title</label>
                  <input 
                    required
                    type="text" 
                    value={reminderData.title}
                    onChange={(e) => setReminderData({...reminderData, title: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all"
                    placeholder="Enter task title"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Description</label>
                  <textarea 
                    value={reminderData.description}
                    onChange={(e) => setReminderData({...reminderData, description: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all resize-none h-24"
                    placeholder="Enter description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Date</label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required
                        type="date" 
                        value={reminderData.date}
                        onChange={(e) => setReminderData({...reminderData, date: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required
                        type="time" 
                        value={reminderData.time}
                        onChange={(e) => setReminderData({...reminderData, time: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Reminder whom</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select 
                      required
                      value={reminderData.userId}
                      onChange={(e) => handleUserSelect(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all appearance-none"
                    >
                      <option value="">Select Name</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Mail Id</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="email" 
                      value={reminderData.email}
                      readOnly
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                      placeholder="Auto-filled email"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsReminderModalOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20"
                  >
                    Save Reminder
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
