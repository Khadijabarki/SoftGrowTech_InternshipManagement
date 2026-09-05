/**
 * Internship Management System - Data Engine & Storage Manager
 * Handles pre-populated dataset seeding and localStorage persistence.
 */

const STORAGE_KEYS = {
    USERS: 'ims_users',
    TASKS: 'ims_tasks',
    SUBMISSIONS: 'ims_submissions',
    CURRENT_USER: 'ims_current_user',
    THEME: 'ims_theme'
};

// Initial Seed Data
const INITIAL_USERS = [
    {
        id: 'u-1',
        name: 'Alex Morgan',
        email: 'alex@intern.com',
        password: 'password123',
        role: 'intern',
        department: 'Software Engineering',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        joinedDate: '2026-08-01'
    },
    {
        id: 'u-2',
        name: 'Sarah Chen',
        email: 'sarah@intern.com',
        password: 'password123',
        role: 'intern',
        department: 'UI/UX Design',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        joinedDate: '2026-08-05'
    },
    {
        id: 'u-3',
        name: 'David Kim',
        email: 'david@intern.com',
        password: 'password123',
        role: 'intern',
        department: 'Data Analytics',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
        joinedDate: '2026-08-10'
    },
    {
        id: 'admin-1',
        name: 'Elena Rostova',
        email: 'admin@company.com',
        password: 'admin123',
        role: 'admin',
        title: 'Lead Technical Mentor',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
        joinedDate: '2025-01-15'
    }
];

const INITIAL_TASKS = [
    {
        id: 'task-101',
        title: 'Responsive Dashboard Design System',
        category: 'UI/UX Design',
        description: 'Create a comprehensive design system featuring color tokens, responsive cards, typography, and dark mode toggles.',
        dueDate: '2026-09-10',
        priority: 'High',
        assignedTo: 'all',
        createdBy: 'Elena Rostova'
    },
    {
        id: 'task-102',
        title: 'REST API Authentication & JWT Middleware',
        category: 'Backend',
        description: 'Implement JWT token authentication, refresh token rotation, and password hashing logic.',
        dueDate: '2026-09-12',
        priority: 'Medium',
        assignedTo: 'u-1',
        createdBy: 'Elena Rostova'
    },
    {
        id: 'task-103',
        title: 'User Analytics & Metric Tracker',
        category: 'Data Analytics',
        description: 'Build visualization scripts for tracking daily active user retention and conversion funnel rates.',
        dueDate: '2026-09-14',
        priority: 'Low',
        assignedTo: 'u-3',
        createdBy: 'Elena Rostova'
    },
    {
        id: 'task-104',
        title: 'Mobile Navigation Menu & Gesture Hooks',
        category: 'Frontend',
        description: 'Develop a touch-friendly slide-over navigation drawer for smaller screen viewports.',
        dueDate: '2026-09-18',
        priority: 'Medium',
        assignedTo: 'all',
        createdBy: 'Elena Rostova'
    }
];

const INITIAL_SUBMISSIONS = [
    {
        id: 'sub-1',
        taskId: 'task-101',
        taskTitle: 'Responsive Dashboard Design System',
        internId: 'u-1',
        internName: 'Alex Morgan',
        category: 'UI/UX Design',
        repoUrl: 'https://github.com/alex/dashboard-ui',
        description: 'Created CSS variables for dynamic theme toggling and built dynamic metric cards.',
        submissionDate: '2026-09-01',
        status: 'Approved',
        feedback: 'Fantastic job Alex! The color system is well modularized and responsive breakpoints are clean.',
        reviewedDate: '2026-09-02'
    },
    {
        id: 'sub-2',
        taskId: 'task-102',
        taskTitle: 'REST API Authentication & JWT Middleware',
        internId: 'u-1',
        internName: 'Alex Morgan',
        category: 'Backend',
        repoUrl: 'https://github.com/alex/express-auth-module',
        description: 'Implemented bcrypt password hashing and token expiration handling.',
        submissionDate: '2026-09-03',
        status: 'Pending',
        feedback: '',
        reviewedDate: ''
    },
    {
        id: 'sub-3',
        taskId: 'task-101',
        taskTitle: 'Responsive Dashboard Design System',
        internId: 'u-2',
        internName: 'Sarah Chen',
        category: 'UI/UX Design',
        repoUrl: 'https://figma.com/file/sarah-design-system',
        description: 'Figma mockups and preliminary HTML layout for user dashboard.',
        submissionDate: '2026-09-02',
        status: 'Needs Revision',
        feedback: 'Great initial layout! Please check mobile breakpoints for screens under 480px width.',
        reviewedDate: '2026-09-03'
    },
    {
        id: 'sub-4',
        taskId: 'task-103',
        taskTitle: 'User Analytics & Metric Tracker',
        internId: 'u-3',
        internName: 'David Kim',
        category: 'Data Analytics',
        repoUrl: 'https://github.com/david/analytics-scripts',
        description: 'Python data processing script and JSON chart output builder.',
        submissionDate: '2026-09-04',
        status: 'Approved',
        feedback: 'Impressive code readability and clean chart data pipelines!',
        reviewedDate: '2026-09-04'
    }
];

class StorageManager {
    static init() {
        if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
            localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
            localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
        }
    }

    // Users
    static getUsers() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    }

    static addUser(user) {
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        return user;
    }

    static findUserByEmail(email) {
        const users = this.getUsers();
        return users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    // Session Management
    static getCurrentUser() {
        const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        return data ? JSON.parse(data) : null;
    }

    static setCurrentUser(user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }

    static clearCurrentUser() {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }

    // Tasks
    static getTasks() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS)) || [];
    }

    static addTask(task) {
        const tasks = this.getTasks();
        tasks.unshift(task);
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        return task;
    }

    // Submissions
    static getSubmissions() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) || [];
    }

    static addSubmission(submission) {
        const submissions = this.getSubmissions();
        submissions.unshift(submission);
        localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
        return submission;
    }

    static updateSubmission(updatedSub) {
        let submissions = this.getSubmissions();
        const index = submissions.findIndex(s => s.id === updatedSub.id);
        if (index !== -1) {
            submissions[index] = { ...submissions[index], ...updatedSub };
            localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
            return submissions[index];
        }
        return null;
    }
}

// Initialize seed data on file load
StorageManager.init();
