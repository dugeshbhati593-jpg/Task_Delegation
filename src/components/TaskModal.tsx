import { useState, useEffect } from "react";
import { X, Plus, Trash2, CheckCircle2, Circle, Paperclip, Bell } from "lucide-react";
import { Task, User, Priority, ChecklistItem } from "@/src/types";
import { cn } from "@/src/lib/utils";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Task>) => void;
  users: User[];
  task?: Task | null;
  currentUser: User;
}

export function TaskModal({ isOpen, onClose, onSubmit, users, task, currentUser }: TaskModalProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium',
    deadline: '',
    assignee_id: null,
    project_name: '',
    creator_name: 'Tushar Mumbai office',
    creator_location: 'Mumbai office',
    reminders_enabled: true,
    attachment: null,
    tags: [],
    checklist: []
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
        assignee_id: task.assignee_id,
        project_name: task.project_name || '',
        creator_name: task.creator_name || 'Tushar Mumbai office',
        creator_location: task.creator_location || 'Mumbai office',
        reminders_enabled: task.reminders_enabled ?? true,
        attachment: task.attachment || null,
        tags: task.tags || [],
        checklist: task.checklist || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        deadline: '',
        assignee_id: null,
        project_name: '',
        creator_name: 'Tushar Mumbai office',
        creator_location: 'Mumbai office',
        reminders_enabled: true,
        attachment: null,
        tags: [],
        checklist: []
      });
    }
  }, [task, isOpen]);

  const assignableUsers = users.filter(user => {
    if (user.id === currentUser.id) return true;
    if (currentUser.role === 'master' || currentUser.role === 'admin') {
      return user.role === 'admin' || user.role === 'user';
    }
    return user.role === 'user';
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {task ? 'Edit Task' : 'Create New Task'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">Fill in the details to delegate this task.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(formData);
        }} className="p-8 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Project Name</label>
              <input 
                type="text" 
                value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                placeholder="e.g. Delegation App Feature Enhancement"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Task Title</label>
              <input 
                required
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="What needs to be done?"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Assign To (Employee)</label>
              <select 
                value={formData.assignee_id || ''}
                onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value ? Number(e.target.value) : null })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all"
              >
                <option value="">Select Employee</option>
                {assignableUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Task Due Date & Time</label>
              <input 
                type="datetime-local" 
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
            <input 
              type="checkbox" 
              id="reminders"
              checked={formData.reminders_enabled}
              onChange={(e) => setFormData({ ...formData, reminders_enabled: e.target.checked })}
              className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="reminders" className="text-sm font-medium text-slate-700 cursor-pointer">
              Send Automatic Reminders <span className="text-[10px] text-blue-500 font-bold uppercase ml-1">(Requires Cloud Functions)</span>
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Attachment</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 border-dashed rounded-2xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:border-brand-300 cursor-pointer transition-all w-full">
                <Paperclip className="w-4 h-4" />
                {formData.attachment ? formData.attachment : 'Attach a file'}
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, attachment: file.name });
                    }
                  }}
                />
              </label>
              {formData.attachment && (
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, attachment: null })}
                  className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700">Description</label>
              <button
                type="button"
                onClick={async () => {
                  if (!formData.title) return;
                  try {
                    const response = await fetch('/api/ai/generate', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ prompt: formData.title })
                    });
                    const data = await response.json();
                    if (data.text) {
                      setFormData({ ...formData, description: data.text });
                    }
                  } catch (error) {
                    console.error('AI Generation failed:', error);
                  }
                }}
                className="text-[10px] font-bold text-brand-600 uppercase tracking-widest hover:text-brand-700 flex items-center gap-1"
              >
                <Bell className="w-3 h-3" />
                Generate with AI
              </button>
            </div>
            <textarea 
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide more context about this task..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all resize-none"
            />
          </div>
        </form>

        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex gap-4 shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-white transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSubmit(formData)}
            className="flex-1 px-6 py-3 bg-brand-600 text-white rounded-2xl text-sm font-bold hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20"
          >
            {task ? 'Save Changes' : 'Delegate Task'}
          </button>
        </div>
      </div>
    </div>
  );
}

