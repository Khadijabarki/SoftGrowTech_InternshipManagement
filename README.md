# 🎓 Internship Management Portal

A modern, responsive, and role-based **Internship Management Web Application** designed to streamline task assignments, deliverable submissions, and mentor evaluations. Built with vanilla web technologies, persistent local storage, and a dual-portal interface for **Interns** and **Admin Mentors**.

---

## 🌟 Live Demo & Quick Credentials

The system includes pre-seeded demo accounts with **1-click instant login buttons** directly on the landing page:

| Role | Name | Email | Password | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Mentor** | Elena Rostova | `admin@company.com` | `admin123` | Task broadcasting, submission reviews, intern roster |
| **Intern** | Alex Morgan | `alex@intern.com` | `password123` | Task tracking, deliverable submissions, review inspection |
| **Intern** | Sarah Chen | `sarah@intern.com` | `password123` | Track UI/UX Design tasks & submissions |
| **Intern** | David Kim | `david@intern.com` | `password123` | Track Data Analytics tasks & submissions |

---

## ✨ Key Features

### 🔐 1. Authentication & Role-Based Access Control (RBAC)
- **Multi-Role Login & Registration**: Seamless switching between **Intern** and **Admin Mentor** workflows.
- **Session Guards**: Client-side protected routes preventing unauthorized access to restricted dashboard views.
- **Password Visibility Toggles**: Built-in interactive eye-icon password reveals.
- **Fast Demo Access**: Instant 1-click login for quick evaluation without manual credential typing.

### 👨‍💻 2. Intern Portal (`intern-dashboard.html`)
- **Live Metric Counters**: Real-time stats for *Tasks Assigned*, *Tasks Submitted*, *Approved*, and *Pending Review*.
- **Dynamic Completion Rate**: Visual progress bar tracking overall internship milestones and completion percentage.
- **Deliverables Board**: Card grid displaying active tasks assigned by mentors with priority tags (High, Medium, Low), deadlines, and categories.
- **Interactive Submission Engine**: Modal-driven submission workflow accepting repository/cloud drive URLs, categories, dates, and implementation summaries.
- **Submission History Table**:
  - Live text search across task titles and categories.
  - Interactive status filter pills (`All`, `Approved`, `Pending`, `Needs Revision`).
  - Feedback detail modal displaying reviewer notes and approval stamps.

### 👑 3. Admin Mentor Review Center (`admin-dashboard.html`)
- **Operational Health Overview**: High-level KPIs tracking active interns, pending evaluations, approved deliverables, and active task broadcasts.
- **Review Center Table**: Filterable and searchable table of all intern submissions across the organization.
- **Interactive Evaluation Modal**:
  - Review intern notes and direct project links.
  - Set evaluation status: `Approved`, `Needs Revision`, or `Rejected`.
  - Provide structured constructive mentor feedback.
- **Task Broadcast System**: Create and broadcast new tasks to either **All Interns** or targeted individuals with categories, priorities, and deadlines.
- **Intern Roster Directory**: Directory cards displaying enrolled interns, department/track, join date, and individual progress bars.

### 🎨 4. Design & User Experience
- **Theme Switcher**: Smooth Light and Dark Mode toggle with automatic user preference persistence in `localStorage`.
- **Glassmorphic UI**: Gradient meshes, floating ambient blobs, modern typography (`Inter`), and card hover elevations.
- **Toast Notifications Engine**: Non-blocking toast alert system for success, error, and informational feedback.
- **Zero External Dependencies**: Pure Vanilla JavaScript, HTML5, and CSS3 without heavy frameworks or build steps.

---

## 🗂️ Project Structure

```text
intern-management-web/
├── index.html               # Authentication landing page (Login, Register, Demo access)
├── intern-dashboard.html    # Intern portal (Metrics, deliverables, submissions, feedback)
├── admin-dashboard.html     # Admin portal (Task broadcast, evaluation review, intern roster)
├── css/
│   └── style.css            # Unified design system, CSS variables, dark/light themes & components
├── js/
│   ├── data.js              # In-browser data engine, pre-seeded datasets & localStorage manager
│   ├── auth.js              # Authentication logic, form validation & session handling
│   ├── intern.js            # Intern dashboard controller & submission engine
│   ├── admin.js             # Admin dashboard controller, review modal & task broadcasting
│   ├── theme.js             # Dark / Light theme switcher with persistence
│   └── toast.js             # Toast notification feedback engine
└── README.md                # Project documentation
```

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Markup** | HTML5 (Semantic, Accessible elements) |
| **Styling** | Modern CSS3 (Custom properties, CSS Grid, Flexbox, Glassmorphism, Animations) |
| **Logic** | Vanilla JavaScript (ES6+, DOM Manipulation, Event Listeners) |
| **Storage** | Browser `localStorage` (Client-side persistent database) |
| **Typography & Assets** | Google Fonts (`Inter`), SVG Icons, DiceBear Avatars API |

---

## 🚀 Getting Started

No build tools, package managers, or backend installations are required.

### Method 1: Direct Browser Launch
1. Clone or download this repository.
2. Double-click `index.html` or open it in any modern browser (Google Chrome, Microsoft Edge, Firefox, Safari).

### Method 2: Local HTTP Server (Recommended)
Using a lightweight local server ensures clean asset loading and relative path consistency:

#### Using VS Code Live Server:
- Right-click `index.html` inside VS Code and select **"Open with Live Server"**.

---

## 🗄️ Data Storage Architecture

All state is stored and persisted across page reloads in the browser's `localStorage` via the `StorageManager` module (`js/data.js`):

| Key | Description |
| :--- | :--- |
| `ims_users` | Registered users (both interns and admin mentors) |
| `ims_tasks` | Broadcasted assignments, categories, deadlines, and assignees |
| `ims_submissions` | Submitted project deliverables, repository links, statuses, and mentor feedback |
| `ims_current_user` | Currently authenticated user session object |
| `ims_theme` | Active theme preference (`light` or `dark`) |

> 💡 **Resetting Demo Data:** To reset the application state back to factory defaults at any time, open your browser DevTools (`F12`), navigate to **Application > Local Storage**, clear the keys, and refresh the page.

---

## 👩‍💻 Author

 **Khadija Barki** <br>
 *Web Development Intern at SoftGrowTech*
