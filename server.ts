import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  }
});

// Groq AI Proxy
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'mixtral-8x7b-32768';

const db = new Database("tasks.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar TEXT
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo',
    priority TEXT DEFAULT 'medium',
    deadline TEXT,
    assignee_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignee_id) REFERENCES users(id)
  );
`);

// Migration: Add missing columns if they don't exist
const userTableInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
const userColumnNames = userTableInfo.map(info => info.name);

if (!userColumnNames.includes('password')) {
  db.exec("ALTER TABLE users ADD COLUMN password TEXT DEFAULT 'password'");
}
if (!userColumnNames.includes('role')) {
  db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
}
if (!userColumnNames.includes('designation')) {
  db.exec("ALTER TABLE users ADD COLUMN designation TEXT DEFAULT 'Employee'");
}
if (!userColumnNames.includes('location')) {
  db.exec("ALTER TABLE users ADD COLUMN location TEXT DEFAULT 'Office'");
}
if (!userColumnNames.includes('dob')) {
  db.exec("ALTER TABLE users ADD COLUMN dob TEXT");
}

// Hash existing plain text passwords
const usersWithPlainPassword = db.prepare("SELECT id, password FROM users WHERE password NOT LIKE '$2a$%' AND password NOT LIKE '$2b$%'").all() as any[];
for (const user of usersWithPlainPassword) {
  if (user.password) {
    const hashedPassword = bcrypt.hashSync(user.password, 10);
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedPassword, user.id);
  }
}

const tableInfo = db.prepare("PRAGMA table_info(tasks)").all() as any[];
const columnNames = tableInfo.map(info => info.name);

if (!columnNames.includes('tags')) {
  db.exec("ALTER TABLE tasks ADD COLUMN tags TEXT DEFAULT '[]'");
}
if (!columnNames.includes('checklist')) {
  db.exec("ALTER TABLE tasks ADD COLUMN checklist TEXT DEFAULT '[]'");
}
if (!columnNames.includes('creator_name')) {
  db.exec("ALTER TABLE tasks ADD COLUMN creator_name TEXT");
}
if (!columnNames.includes('creator_location')) {
  db.exec("ALTER TABLE tasks ADD COLUMN creator_location TEXT");
}
if (!columnNames.includes('project_name')) {
  db.exec("ALTER TABLE tasks ADD COLUMN project_name TEXT");
}
if (!columnNames.includes('reminders_enabled')) {
  db.exec("ALTER TABLE tasks ADD COLUMN reminders_enabled INTEGER DEFAULT 0");
}
if (!columnNames.includes('attachment')) {
  db.exec("ALTER TABLE tasks ADD COLUMN attachment TEXT");
}
if (!columnNames.includes('type')) {
  db.exec("ALTER TABLE tasks ADD COLUMN type TEXT DEFAULT 'task'");
}


// Seed initial users if empty
const userCount = db.prepare("SELECT count(*) as count FROM users").get() as { count: number };
const defaultPassword = bcrypt.hashSync("password", 10);

if (userCount.count === 0) {
  const insertUser = db.prepare("INSERT INTO users (name, email, avatar, password, role, designation) VALUES (?, ?, ?, ?, ?, ?)");
  insertUser.run("Master Admin", "master@admin.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=Master", defaultPassword, "master", "CEO");
  insertUser.run("Admin User", "admin@admin.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin", defaultPassword, "admin", "Manager");
  insertUser.run("John Doe", "john@example.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=John", defaultPassword, "user", "Developer");
  insertUser.run("Jane Smith", "jane@example.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane", defaultPassword, "user", "Designer");
} else {
  // Force reset default users' passwords to ensure they work correctly
  db.prepare("UPDATE users SET password = ? WHERE email IN ('master@admin.com', 'admin@admin.com', 'john@example.com', 'jane@example.com')").run(defaultPassword);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Groq AI Proxy Route
  app.post('/api/ai/generate', async (req, res) => {
    const { prompt } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Groq API key not configured' });
    }

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that helps generate professional task descriptions based on a title. Keep it concise and professional.'
            },
            {
              role: 'user',
              content: `Generate a professional task description for: ${prompt}`
            }
          ],
          max_tokens: 500
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || 'Groq API Error');
      }
      res.json({ text: data.choices[0].message.content });
    } catch (error) {
      console.error('Groq AI Proxy Error:', error);
      res.status(500).json({ error: 'Failed to generate content' });
    }
  });

  // Helper to parse JSON fields
  const parseTask = (task: any) => ({
    ...task,
    reminders_enabled: !!task.reminders_enabled,
    tags: JSON.parse(task.tags || '[]'),
    checklist: JSON.parse(task.checklist || '[]')
  });

  // API Routes
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const trimmedEmail = email?.trim()?.toLowerCase();
    const trimmedPassword = password?.trim();
    console.log(`Login attempt for email: '${trimmedEmail}'`);
    
    const user = db.prepare("SELECT * FROM users WHERE LOWER(email) = ?").get(trimmedEmail) as any;
    
    if (user) {
      console.log(`User found. Stored hash: ${user.password}`);
      
      // Check if it's the exact string "password" (fallback for default accounts)
      const isDefaultPassword = trimmedPassword === "password" && 
        ['master@admin.com', 'admin@admin.com', 'john@example.com', 'jane@example.com'].includes(trimmedEmail);
        
      const isValid = isDefaultPassword || bcrypt.compareSync(trimmedPassword, user.password);
      console.log(`Password valid: ${isValid} (isDefault: ${isDefaultPassword})`);
      
      if (isValid) {
        const { password: _, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      }
    } else {
      console.log(`User not found for email: '${trimmedEmail}'`);
    }
    
    res.status(401).json({ error: "Invalid email or password" });
  });

  app.get("/api/users", (req, res) => {
    const users = db.prepare("SELECT id, name, email, avatar, role, designation, location, dob FROM users").all();
    res.json(users);
  });

  app.post("/api/users", (req, res) => {
    const { name, email, password, role, designation } = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const info = db.prepare(`
        INSERT INTO users (name, email, password, role, designation, avatar)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(name, email, hashedPassword, role, designation, `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`);
      
      const newUser = db.prepare("SELECT id, name, email, avatar, role, designation, location, dob FROM users WHERE id = ?").get(info.lastInsertRowid) as any;
      
      // Send welcome email with credentials
      if (newUser && newUser.email) {
        const mailOptions = {
          from: process.env.SMTP_USER || 'your-email@gmail.com',
          to: newUser.email,
          subject: `Welcome to Ginza Industries - Account Created`,
          html: `
            <h3>Hello ${name},</h3>
            <p>Your account has been created successfully at Ginza Industries Ltd.</p>
            <p><strong>Site Path:</strong> ${process.env.APP_URL || 'https://ais-pre-rcedxjraz3d6jrx73vs3at-324063405842.asia-southeast1.run.app'}</p>
            <p><strong>Username (Email):</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p>Please login and change your password for security.</p>
          `
        };

        transporter.sendMail(mailOptions).catch(err => console.error("Welcome email failed:", err));
      }

      res.status(201).json(newUser);
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: "Email already exists" });
      } else {
        res.status(500).json({ error: "Failed to create user" });
      }
    }
  });

  app.patch("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const { location, dob, avatar } = req.body;
    
    const currentUser = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as any;
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    db.prepare(`
      UPDATE users 
      SET location = ?, dob = ?, avatar = ?
      WHERE id = ?
    `).run(
      location ?? currentUser.location,
      dob ?? currentUser.dob,
      avatar ?? currentUser.avatar,
      id
    );

    const updatedUser = db.prepare("SELECT id, name, email, avatar, role, designation, location, dob FROM users WHERE id = ?").get(id);
    res.json(updatedUser);
  });

  app.delete("/api/users/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM users WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.get("/api/tasks", (req, res) => {
    const tasks = db.prepare(`
      SELECT tasks.*, users.name as assignee_name, users.avatar as assignee_avatar 
      FROM tasks 
      LEFT JOIN users ON tasks.assignee_id = users.id
      ORDER BY created_at DESC
    `).all();
    res.json(tasks.map(parseTask));
  });

  app.post("/api/tasks", (req, res) => {
    const { title, description, priority, deadline, assignee_id, tags, checklist, creator_name, creator_location, project_name, reminders_enabled, attachment, type } = req.body;
    try {
      const info = db.prepare(`
        INSERT INTO tasks (title, description, priority, deadline, assignee_id, tags, checklist, creator_name, creator_location, project_name, reminders_enabled, attachment, type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        title, 
        description, 
        priority, 
        deadline, 
        assignee_id, 
        JSON.stringify(tags || []), 
        JSON.stringify(checklist || []),
        creator_name || 'Admin',
        creator_location || 'Main Office',
        project_name || 'General',
        reminders_enabled ? 1 : 0,
        attachment || null,
        type || 'task'
      );
      
      const newTask = db.prepare(`
        SELECT tasks.*, users.name as assignee_name, users.avatar as assignee_avatar 
        FROM tasks 
        LEFT JOIN users ON tasks.assignee_id = users.id
        WHERE tasks.id = ?
      `).get(info.lastInsertRowid);
      
      // Send email to assignee
      if (assignee_id) {
        const assignee = db.prepare("SELECT email, name FROM users WHERE id = ?").get(assignee_id) as any;
        if (assignee && assignee.email) {
          const mailOptions = {
            from: process.env.SMTP_USER || 'your-email@gmail.com',
            to: assignee.email,
            subject: `New Task Assigned: ${title}`,
            html: `
              <h3>Hello ${assignee.name},</h3>
              <p>A new task has been assigned to you by ${creator_name || 'Admin'}.</p>
              <p><strong>Task:</strong> ${title}</p>
              <p><strong>Description:</strong> ${description || 'No description provided.'}</p>
              <p><strong>Priority:</strong> ${priority}</p>
              <p><strong>Deadline:</strong> ${deadline ? new Date(deadline).toLocaleString() : 'No deadline'}</p>
              <p>Please login to your dashboard to view more details.</p>
            `
          };

          transporter.sendMail(mailOptions).catch(err => console.error("Email failed:", err));
        }
      }
      
      res.status(201).json(parseTask(newTask));
    } catch (error) {
      console.error("Failed to create task:", error);
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", (req, res) => {
    const { id } = req.params;
    const { status, priority, assignee_id, title, description, deadline, tags, checklist, creator_name, creator_location, project_name, reminders_enabled, attachment, type } = req.body;
    
    const currentTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as any;
    if (!currentTask) return res.status(404).json({ error: "Task not found" });

    db.prepare(`
      UPDATE tasks 
      SET status = ?, priority = ?, assignee_id = ?, title = ?, description = ?, deadline = ?, tags = ?, checklist = ?, creator_name = ?, creator_location = ?, project_name = ?, reminders_enabled = ?, attachment = ?, type = ?
      WHERE id = ?
    `).run(
      status ?? currentTask.status,
      priority ?? currentTask.priority,
      assignee_id ?? currentTask.assignee_id,
      title ?? currentTask.title,
      description ?? currentTask.description,
      deadline ?? currentTask.deadline,
      tags ? JSON.stringify(tags) : currentTask.tags,
      checklist ? JSON.stringify(checklist) : currentTask.checklist,
      creator_name ?? currentTask.creator_name,
      creator_location ?? currentTask.creator_location,
      project_name ?? currentTask.project_name,
      reminders_enabled !== undefined ? (reminders_enabled ? 1 : 0) : currentTask.reminders_enabled,
      attachment !== undefined ? attachment : currentTask.attachment,
      type ?? currentTask.type,
      id
    );

    const updatedTask = db.prepare(`
      SELECT tasks.*, users.name as assignee_name, users.avatar as assignee_avatar 
      FROM tasks 
      LEFT JOIN users ON tasks.assignee_id = users.id
      WHERE tasks.id = ?
    `).get(id);

    res.json(parseTask(updatedTask));
  });

  app.delete("/api/tasks/:id", (req, res) => {
    db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);
    res.status(204).end();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
