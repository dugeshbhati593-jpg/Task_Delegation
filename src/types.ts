export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'completed' | 'overdue';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: 'master' | 'admin' | 'user';
  designation: string;
  location: string | null;
  dob: string | null;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  deadline: string;
  assignee_id: number | null;
  assignee_name: string | null;
  assignee_avatar: string | null;
  creator_name: string | null;
  creator_location: string | null;
  project_name: string | null;
  reminders_enabled: boolean;
  attachment: string | null;
  type: 'task' | 'reminder';
  tags: string[];
  checklist: ChecklistItem[];
  created_at: string;
}
