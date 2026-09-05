/**
 * Internship Management System - Admin Portal Controller
 * Manages admin metrics, submission reviews, feedback notes, task broadcasting, and intern roster.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Session Guard Check
    const currentUser = StorageManager.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
        showToast('Access denied. Admin credentials required.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
        return;
    }

    // State Variables
    let activeFilter = 'All';
    let searchQuery = '';

    // Element References
    const adminNameDisplay = document.getElementById('admin-name-display');
    const adminAvatar = document.getElementById('admin-avatar');
    const logoutBtn = document.getElementById('logout-btn');

    const metricInternsCount = document.getElementById('metric-interns-count');
    const metricPendingReviews = document.getElementById('metric-pending-reviews');
    const metricApprovedCount = document.getElementById('metric-approved-count');
    const metricBroadcastTasks = document.getElementById('metric-broadcast-tasks');

    const adminTableBody = document.getElementById('admin-table-body');
    const adminSearchInput = document.getElementById('admin-search-input');
    const adminFilterPills = document.querySelectorAll('#admin-filter-pills .filter-pill');
    const internRosterGrid = document.getElementById('intern-roster-grid');

    const taskModal = document.getElementById('task-modal');
    const openTaskBroadcastBtn = document.getElementById('open-task-broadcast-btn');
    const broadcastTaskForm = document.getElementById('broadcast-task-form');
    const taskAssigneeSelect = document.getElementById('task-assignee');

    const reviewModal = document.getElementById('review-modal');
    const reviewSubmissionForm = document.getElementById('review-submission-form');

    // Populate Header
    adminNameDisplay.textContent = currentUser.name;
    adminAvatar.src = currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.name)}`;

    // Set default task due date to +7 days from today
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    document.getElementById('task-due').value = nextWeek.toISOString().split('T')[0];

    // Logout Handler
    logoutBtn.addEventListener('click', () => {
        StorageManager.clearCurrentUser();
        showToast('Logged out successfully', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    });

    // 2. Main Admin Dashboard Render
    function renderAdminDashboard() {
        const allUsers = StorageManager.getUsers();
        const allTasks = StorageManager.getTasks();
        const allSubmissions = StorageManager.getSubmissions();

        const interns = allUsers.filter(u => u.role === 'intern');
        const pendingCount = allSubmissions.filter(s => s.status === 'Pending').length;
        const approvedCount = allSubmissions.filter(s => s.status === 'Approved').length;

        // Populate Metrics
        metricInternsCount.textContent = interns.length;
        metricPendingReviews.textContent = pendingCount;
        metricApprovedCount.textContent = approvedCount;
        metricBroadcastTasks.textContent = allTasks.length;

        // Populate Assignee Select options in Task Broadcast Modal
        populateAssigneeOptions(interns);

        // Render Review Submissions Table
        renderSubmissionsTable(allSubmissions);

        // Render Intern Roster Grid
        renderInternRoster(interns, allSubmissions);
    }

    // 3. Populate Assignee Select Options
    function populateAssigneeOptions(interns) {
        // Keep the first option (Broadcast to ALL)
        taskAssigneeSelect.innerHTML = `<option value="all">Broadcast to ALL Interns</option>`;
        interns.forEach(intern => {
            const opt = document.createElement('option');
            opt.value = intern.id;
            opt.textContent = `${intern.name} (${intern.department || 'Intern'})`;
            taskAssigneeSelect.appendChild(opt);
        });
    }

    // 4. Render Submissions Review Center Table
    function renderSubmissionsTable(submissions) {
        adminTableBody.innerHTML = '';

        // Filter by Status Pill
        let filtered = submissions.filter(s => {
            if (activeFilter === 'All') return true;
            return s.status === activeFilter;
        });

        // Search Query Filter
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(s =>
                s.internName.toLowerCase().includes(q) ||
                s.taskTitle.toLowerCase().includes(q) ||
                s.category.toLowerCase().includes(q)
            );
        }

        if (filtered.length === 0) {
            adminTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        No intern submissions match the selected filters.
                    </td>
                </tr>
            `;
            return;
        }

        filtered.forEach(sub => {
            const tr = document.createElement('tr');
            const badgeClass = getBadgeClass(sub.status);

            tr.innerHTML = `
                <td>
                    <div style="font-weight: 700;">${escapeHTML(sub.internName)}</div>
                </td>
                <td><strong>${escapeHTML(sub.taskTitle)}</strong></td>
                <td>${escapeHTML(sub.category)}</td>
                <td>${sub.submissionDate}</td>
                <td>
                    <a href="${escapeHTML(sub.repoUrl)}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 0.3rem;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        Deliverable Link
                    </a>
                </td>
                <td><span class="badge ${badgeClass}">${sub.status}</span></td>
                <td style="text-align: right;">
                    <button class="btn btn-primary review-action-btn" data-id="${sub.id}" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;">
                        Review Submission
                    </button>
                </td>
            `;

            adminTableBody.appendChild(tr);
        });

        // Add event listeners to "Review Submission" buttons
        document.querySelectorAll('.review-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const subId = btn.getAttribute('data-id');
                const sub = submissions.find(s => s.id === subId);
                if (sub) {
                    openReviewModal(sub);
                }
            });
        });
    }

    function getBadgeClass(status) {
        switch (status) {
            case 'Approved': return 'badge-approved';
            case 'Pending': return 'badge-pending';
            case 'Needs Revision': return 'badge-needs-revision';
            case 'Rejected': return 'badge-rejected';
            default: return 'badge-pending';
        }
    }

    // 5. Open & Populate Review Modal
    function openReviewModal(sub) {
        document.getElementById('review-sub-id').value = sub.id;
        document.getElementById('review-modal-title').textContent = sub.taskTitle;
        document.getElementById('review-modal-intern').textContent = `Submitted by: ${sub.internName}`;
        document.getElementById('review-modal-desc').textContent = sub.description;
        
        const link = document.getElementById('review-modal-link');
        link.href = sub.repoUrl;
        link.textContent = `🔗 ${sub.repoUrl}`;

        document.getElementById('review-status').value = sub.status;
        document.getElementById('review-feedback').value = sub.feedback || '';

        openModal(reviewModal);
    }

    // 6. Handle Review Form Submit
    reviewSubmissionForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const subId = document.getElementById('review-sub-id').value;
        const newStatus = document.getElementById('review-status').value;
        const feedbackNote = document.getElementById('review-feedback').value.trim();

        const updated = StorageManager.updateSubmission({
            id: subId,
            status: newStatus,
            feedback: feedbackNote,
            reviewedDate: new Date().toISOString().split('T')[0]
        });

        if (updated) {
            showToast(`Submission review updated to '${newStatus}'!`, 'success');
            closeModal(reviewModal);
            renderAdminDashboard();
        } else {
            showToast('Failed to update submission record.', 'error');
        }
    });

    // 7. Handle Broadcast New Task Form Submit
    broadcastTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('task-title').value.trim();
        const category = document.getElementById('task-category').value;
        const assignee = document.getElementById('task-assignee').value;
        const priority = document.getElementById('task-priority').value;
        const dueDate = document.getElementById('task-due').value;
        const description = document.getElementById('task-desc').value.trim();

        const newTask = {
            id: 'task-' + Date.now(),
            title: title,
            category: category,
            description: description,
            dueDate: dueDate,
            priority: priority,
            assignedTo: assignee,
            createdBy: currentUser.name
        };

        StorageManager.addTask(newTask);
        showToast('New task assignment broadcasted to interns!', 'success');

        closeModal(taskModal);
        broadcastTaskForm.reset();

        // Refresh Dashboard
        renderAdminDashboard();
    });

    // 8. Render Intern Roster Cards
    function renderInternRoster(interns, submissions) {
        internRosterGrid.innerHTML = '';

        if (interns.length === 0) {
            internRosterGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <p>No enrolled interns found.</p>
                </div>
            `;
            return;
        }

        interns.forEach(intern => {
            const internSubs = submissions.filter(s => s.internId === intern.id);
            const approvedSubs = internSubs.filter(s => s.status === 'Approved').length;

            const card = document.createElement('div');
            card.className = 'metric-card';
            card.style.flexDirection = 'column';
            card.style.alignItems = 'flex-start';

            card.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.85rem; width: 100%; margin-bottom: 0.75rem;">
                    <img src="${intern.avatar}" alt="${escapeHTML(intern.name)}" class="avatar-sm" style="width: 44px; height: 44px;">
                    <div>
                        <h4 style="font-size: 0.95rem; font-weight: 700;">${escapeHTML(intern.name)}</h4>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">${escapeHTML(intern.department || 'Intern Track')}</span>
                    </div>
                </div>
                <div style="width: 100%; font-size: 0.8rem; display: flex; justify-content: space-between; padding-top: 0.5rem; border-top: 1px solid var(--border-color);">
                    <span>Submissions: <strong>${internSubs.length}</strong></span>
                    <span style="color: var(--accent-emerald);">Approved: <strong>${approvedSubs}</strong></span>
                </div>
            `;
            internRosterGrid.appendChild(card);
        });
    }

    // Search Input Listener
    adminSearchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        const allSubmissions = StorageManager.getSubmissions();
        renderSubmissionsTable(allSubmissions);
    });

    // Filter Pills Listener
    adminFilterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            adminFilterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeFilter = pill.getAttribute('data-filter');

            const allSubmissions = StorageManager.getSubmissions();
            renderSubmissionsTable(allSubmissions);
        });
    });

    // Modal Control Helpers
    openTaskBroadcastBtn.addEventListener('click', () => {
        broadcastTaskForm.reset();
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        document.getElementById('task-due').value = nextWeek.toISOString().split('T')[0];
        openModal(taskModal);
    });

    function openModal(modal) {
        modal.classList.add('active');
    }

    function closeModal(modal) {
        modal.classList.remove('active');
    }

    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) closeModal(modal);
        });
    });

    [taskModal, reviewModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
    });

    // Helper Utility: Escape HTML
    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // Initial Load Render
    renderAdminDashboard();
});
