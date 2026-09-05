/**
 * Internship Management System - Intern Dashboard Controller
 * Manages intern metrics, submission forms, live history search/filters, and details modal.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Session Guard Check
    const currentUser = StorageManager.getCurrentUser();
    if (!currentUser || currentUser.role !== 'intern') {
        showToast('Access denied. Please log in as an intern.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
        return;
    }

    // State Variables
    let activeFilter = 'All';
    let searchQuery = '';

    // Element References
    const userNameDisplay = document.getElementById('user-name-display');
    const userAvatar = document.getElementById('user-avatar');
    const logoutBtn = document.getElementById('logout-btn');

    const metricAssigned = document.getElementById('metric-assigned');
    const metricSubmitted = document.getElementById('metric-submitted');
    const metricApproved = document.getElementById('metric-approved');
    const metricPending = document.getElementById('metric-pending');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressPercentageText = document.getElementById('progress-percentage-text');

    const assignedTasksGrid = document.getElementById('assigned-tasks-grid');
    const submissionsTableBody = document.getElementById('submissions-table-body');
    const historySearchInput = document.getElementById('history-search-input');
    const statusFilterPills = document.querySelectorAll('.filter-pill');

    const submissionModal = document.getElementById('submission-modal');
    const submissionForm = document.getElementById('submission-form');
    const openSubmitModalBtn = document.getElementById('open-submit-modal-btn');
    const detailsModal = document.getElementById('details-modal');
    const detailsModalContent = document.getElementById('details-modal-content');

    // Populate User Profile Header
    userNameDisplay.textContent = currentUser.name;
    userAvatar.src = currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.name)}`;

    // Set Default Date in Submission Form
    document.getElementById('sub-date').value = new Date().toISOString().split('T')[0];

    // Logout Handler
    logoutBtn.addEventListener('click', () => {
        StorageManager.clearCurrentUser();
        showToast('Logged out successfully', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    });

    // 2. Main Dashboard Render Function
    function renderDashboard() {
        const allTasks = StorageManager.getTasks();
        const allSubmissions = StorageManager.getSubmissions();

        // Tasks assigned to this specific intern or broadcasted to 'all'
        const myTasks = allTasks.filter(t => t.assignedTo === 'all' || t.assignedTo === currentUser.id);

        // Submissions made by this intern
        const mySubmissions = allSubmissions.filter(s => s.internId === currentUser.id);

        // Calculate Metrics
        const assignedCount = myTasks.length;
        const submittedCount = mySubmissions.length;
        const approvedCount = mySubmissions.filter(s => s.status === 'Approved').length;
        const pendingCount = mySubmissions.filter(s => s.status === 'Pending' || s.status === 'Needs Revision').length;

        // Render Counter Text
        metricAssigned.textContent = assignedCount;
        metricSubmitted.textContent = submittedCount;
        metricApproved.textContent = approvedCount;
        metricPending.textContent = pendingCount;

        // Calculate & Animate Completion Rate Progress Bar
        const completionRate = assignedCount > 0 ? Math.min(100, Math.round((approvedCount / assignedCount) * 100)) : 0;
        progressPercentageText.textContent = `${completionRate}%`;
        progressBarFill.style.width = `${completionRate}%`;

        // Render Assigned Tasks Cards
        renderAssignedTasks(myTasks);

        // Render Submissions Table
        renderSubmissionsTable(mySubmissions);
    }

    // 3. Render Assigned Tasks Section
    function renderAssignedTasks(tasks) {
        assignedTasksGrid.innerHTML = '';

        if (tasks.length === 0) {
            assignedTasksGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-icon">📋</div>
                    <p>No active tasks assigned yet.</p>
                </div>
            `;
            return;
        }

        tasks.forEach(task => {
            const card = document.createElement('div');
            card.className = 'task-card';
            card.innerHTML = `
                <div>
                    <div class="task-card-header">
                        <span class="task-category">${escapeHTML(task.category)}</span>
                        <span class="priority-tag priority-${task.priority}">${task.priority} Priority</span>
                    </div>
                    <h3 class="task-card-title">${escapeHTML(task.title)}</h3>
                    <p class="task-card-desc">${escapeHTML(task.description)}</p>
                </div>
                <div class="task-card-footer">
                    <span class="task-due">Due: <strong>${task.dueDate}</strong></span>
                    <button class="btn btn-primary submit-task-btn" data-task-id="${task.id}" data-task-title="${escapeHTML(task.title)}" data-category="${escapeHTML(task.category)}" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">
                        Submit Work
                    </button>
                </div>
            `;
            assignedTasksGrid.appendChild(card);
        });

        // Add event listeners to "Submit Work" buttons inside task cards
        document.querySelectorAll('.submit-task-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const title = btn.getAttribute('data-task-title');
                const category = btn.getAttribute('data-category');

                document.getElementById('sub-task-title').value = title;
                document.getElementById('sub-category').value = category;

                openModal(submissionModal);
            });
        });
    }

    // 4. Render Submission History Table
    function renderSubmissionsTable(submissions) {
        submissionsTableBody.innerHTML = '';

        // Filter by Status Pill
        let filtered = submissions.filter(s => {
            if (activeFilter === 'All') return true;
            return s.status === activeFilter;
        });

        // Search Filter
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(s =>
                s.taskTitle.toLowerCase().includes(q) ||
                s.category.toLowerCase().includes(q)
            );
        }

        if (filtered.length === 0) {
            submissionsTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        No submissions matching the selected filters.
                    </td>
                </tr>
            `;
            return;
        }

        filtered.forEach(sub => {
            const tr = document.createElement('tr');

            const badgeClass = getBadgeClass(sub.status);

            tr.innerHTML = `
                <td><strong>${escapeHTML(sub.taskTitle)}</strong></td>
                <td>${escapeHTML(sub.category)}</td>
                <td>${sub.submissionDate}</td>
                <td>
                    <a href="${escapeHTML(sub.repoUrl)}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 0.3rem;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        View Link
                    </a>
                </td>
                <td><span class="badge ${badgeClass}">${sub.status}</span></td>
                <td style="text-align: right;">
                    <button class="btn btn-secondary view-details-btn" data-id="${sub.id}" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">
                        Details & Feedback
                    </button>
                </td>
            `;

            submissionsTableBody.appendChild(tr);
        });

        // Add event listeners to "Details & Feedback" buttons
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const subId = btn.getAttribute('data-id');
                const sub = submissions.find(s => s.id === subId);
                if (sub) {
                    showSubmissionDetails(sub);
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

    // 5. Show Details Modal with Mentor Feedback
    function showSubmissionDetails(sub) {
        const badgeClass = getBadgeClass(sub.status);
        detailsModalContent.innerHTML = `
            <div style="margin-bottom: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <h4 style="font-size: 1.1rem; font-weight: 700;">${escapeHTML(sub.taskTitle)}</h4>
                    <span class="badge ${badgeClass}">${sub.status}</span>
                </div>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
                    Category: <strong>${escapeHTML(sub.category)}</strong> • Submitted on ${sub.submissionDate}
                </div>
                <div style="background-color: var(--bg-main); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 1rem;">
                    <strong style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Repository Deliverable:</strong>
                    <a href="${escapeHTML(sub.repoUrl)}" target="_blank" rel="noopener noreferrer" style="word-break: break-all;">${escapeHTML(sub.repoUrl)}</a>
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong style="font-size: 0.85rem; color: var(--text-muted); display: block; margin-bottom: 0.25rem;">Your Submission Notes:</strong>
                    <p style="font-size: 0.9rem; line-height: 1.5;">${escapeHTML(sub.description)}</p>
                </div>
            </div>

            <div style="border-top: 1px dashed var(--border-color); padding-top: 1rem;">
                <strong style="font-size: 0.9rem; font-weight: 700; display: block; margin-bottom: 0.5rem; color: var(--primary-600);">
                    💬 Mentor Feedback Note:
                </strong>
                ${sub.feedback ? `
                    <div style="background-color: var(--primary-50); color: var(--text-main); padding: 0.85rem; border-radius: var(--radius-md); border-left: 4px solid var(--primary-600); font-size: 0.9rem;">
                        ${escapeHTML(sub.feedback)}
                    </div>
                ` : `
                    <p style="font-size: 0.875rem; color: var(--text-muted); font-style: italic;">
                        No mentor feedback has been recorded yet. Check back once your submission is reviewed!
                    </p>
                `}
            </div>
        `;
        openModal(detailsModal);
    }

    // 6. Handle New Submission Form
    submissionForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('sub-task-title').value.trim();
        const category = document.getElementById('sub-category').value;
        const repoUrl = document.getElementById('sub-repo-url').value.trim();
        const date = document.getElementById('sub-date').value;
        const description = document.getElementById('sub-description').value.trim();

        const newSubmission = {
            id: 'sub-' + Date.now(),
            taskId: 'task-custom-' + Date.now(),
            taskTitle: title,
            internId: currentUser.id,
            internName: currentUser.name,
            category: category,
            repoUrl: repoUrl,
            description: description,
            submissionDate: date,
            status: 'Pending',
            feedback: '',
            reviewedDate: ''
        };

        StorageManager.addSubmission(newSubmission);
        showToast('Task submitted successfully!', 'success');

        closeModal(submissionModal);
        submissionForm.reset();
        document.getElementById('sub-date').value = new Date().toISOString().split('T')[0];

        // Refresh UI
        renderDashboard();
    });

    // Search Input Event Handler
    historySearchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        const mySubmissions = StorageManager.getSubmissions().filter(s => s.internId === currentUser.id);
        renderSubmissionsTable(mySubmissions);
    });

    // Filter Pills Event Handlers
    statusFilterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            statusFilterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeFilter = pill.getAttribute('data-filter');

            const mySubmissions = StorageManager.getSubmissions().filter(s => s.internId === currentUser.id);
            renderSubmissionsTable(mySubmissions);
        });
    });

    // Open Main Submission Modal Button
    openSubmitModalBtn.addEventListener('click', () => {
        submissionForm.reset();
        document.getElementById('sub-date').value = new Date().toISOString().split('T')[0];
        openModal(submissionModal);
    });

    // Modal Helper Functions
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

    // Close modal on overlay click
    [submissionModal, detailsModal].forEach(modal => {
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
    renderDashboard();
});
