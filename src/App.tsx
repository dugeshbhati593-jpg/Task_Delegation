/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { TaskList } from "./components/TaskList";
import { KanbanBoard } from "./components/KanbanBoard";
import { TaskModal } from "./components/TaskModal";
import { CalendarView } from "./components/CalendarView";
import { Login } from "./components/Login";
import { EmployeesList } from "./components/EmployeesList";
import { ProfileModal } from "./components/ProfileModal";
import { Feed } from "./components/Feed";
import { Task, User } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check for saved user session
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    fetchData();
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const fetchData = async () => {
    try {
      const [tasksRes, usersRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/users')
      ]);
      const tasksData = await tasksRes.json();
      const usersData = await usersRes.json();
      setTasks(tasksData);
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (data: Partial<Task>) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const newTask = await res.json();
      setTasks([newTask, ...tasks]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleUpdateTask = async (data: Partial<Task>) => {
    if (!editingTask) return;
    try {
      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const updatedTask = await res.json();
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      setIsModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleDeleteTask = async (id: number) => {
    setTaskToDelete(id);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await fetch(`/api/tasks/${taskToDelete}`, { method: 'DELETE' });
      setTasks(tasks.filter(t => t.id !== taskToDelete));
      showToast("Task deleted successfully");
    } catch (error) {
      console.error("Failed to delete task:", error);
      showToast("Failed to delete task");
    } finally {
      setTaskToDelete(null);
    }
  };

  const handleStatusChange = async (id: number, status: Task['status']) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const updatedTask = await res.json();
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleUpdateProfile = async (data: Partial<User>) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const updatedUser = await res.json();
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleAddUser = async (data: Partial<User> & { password?: string }) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const newUser = await res.json();
        setUsers([...users, newUser]);
        showToast("User created successfully");
      } else {
        const error = await res.json();
        showToast(error.error || "Failed to create user");
      }
    } catch (error) {
      console.error("Failed to create user:", error);
      showToast("Failed to create user");
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
        showToast("User deleted successfully");
      } else {
        showToast("Failed to delete user");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      showToast("Failed to delete user");
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard tasks={tasks} users={users} />;
      case 'tasks':
        return viewMode === 'list' ? (
          <TaskList 
            tasks={tasks} 
            users={users}
            onEdit={openEditModal} 
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <KanbanBoard 
            tasks={tasks} 
            onEdit={openEditModal} 
            onStatusChange={handleStatusChange}
          />
        );
      case 'team':
        return <EmployeesList users={users} currentUser={currentUser!} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} />;
      case 'calendar':
        return <CalendarView tasks={tasks} users={users} onAddReminder={handleCreateTask} />;
      case 'notifications':
        return <Feed tasks={tasks} users={users} currentUser={currentUser!} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] text-slate-500">
            <p className="text-lg font-medium">Coming Soon</p>
            <p className="text-sm">This feature is currently under development.</p>
          </div>
        );
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-[#f0f2f5] bg-[radial-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-slate-100">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <Header 
          activeTab={activeTab}
          title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} 
          onAddTask={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
        />
        
        <div className="flex-1 overflow-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${viewMode}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        users={users}
        task={editingTask}
        currentUser={currentUser}
      />

      {currentUser && (
        <ProfileModal 
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={currentUser}
          onUpdate={handleUpdateProfile}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-slate-800 text-white px-6 py-3 rounded-xl shadow-xl font-medium text-sm flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            {toastMessage}
          </div>
        </div>
      )}

      {/* Delete Task Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Delete Task</h3>
              <p className="text-sm text-slate-500">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setTaskToDelete(null)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteTask}
                  className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/20"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


