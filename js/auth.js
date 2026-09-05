/**
 * Internship Management System - Authentication Controller
 * Handles role switches, login/register tabs, password toggles, and session routing.
 */

document.addEventListener('DOMContentLoaded', () => {

    // ── Background Particle Generator ──────────────────────────────────────
    (function spawnParticles() {
        const container = document.getElementById('auth-particles');
        if (!container) return;

        const configs = [
            { size: 6,  top: '12%', left: '8%',  delay: '0s',   dur: '5s' },
            { size: 4,  top: '28%', left: '78%', delay: '1.2s', dur: '6s' },
            { size: 8,  top: '68%', left: '15%', delay: '2.1s', dur: '4.5s' },
            { size: 5,  top: '80%', left: '55%', delay: '0.5s', dur: '7s' },
            { size: 3,  top: '42%', left: '92%', delay: '1.8s', dur: '5.5s' },
            { size: 7,  top: '90%', left: '33%', delay: '3s',   dur: '4s' },
            { size: 4,  top: '20%', left: '50%', delay: '0.9s', dur: '6.5s' },
            { size: 5,  top: '55%', left: '70%', delay: '2.5s', dur: '5s' },
            { size: 3,  top: '73%', left: '85%', delay: '1.4s', dur: '8s' },
            { size: 6,  top: '5%',  left: '38%', delay: '3.8s', dur: '6s' },
            { size: 4,  top: '35%', left: '4%',  delay: '0.3s', dur: '5.2s' },
            { size: 9,  top: '85%', left: '72%', delay: '2.2s', dur: '7.5s' },
        ];

        configs.forEach(cfg => {
            const dot = document.createElement('div');
            dot.className = 'auth-particle';
            dot.style.cssText = `
                width: ${cfg.size}px;
                height: ${cfg.size}px;
                top: ${cfg.top};
                left: ${cfg.left};
                animation-delay: ${cfg.delay};
                animation-duration: ${cfg.dur};
                opacity: ${0.2 + cfg.size * 0.04};
            `;
            container.appendChild(dot);
        });
    })();
    // ───────────────────────────────────────────────────────────────────────

    // 1. Session Guard Check
    const currentUser = StorageManager.getCurrentUser();
    if (currentUser) {
        if (currentUser.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
            return;
        } else {
            window.location.href = 'intern-dashboard.html';
            return;
        }
    }

    // State Variables
    let activeRole = 'intern'; // 'intern' or 'admin'
    let activeTab = 'login'; // 'login' or 'register'

    // Element References
    const roleSwitchBtns = document.querySelectorAll('.role-switch-btn');
    const tabLoginBtn = document.getElementById('tab-login-btn');
    const tabRegisterBtn = document.getElementById('tab-register-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginRoleLabel = document.getElementById('login-role-label');
    const regRoleLabel = document.getElementById('reg-role-label');
    const regDeptLabel = document.getElementById('reg-dept-label');

    const demoInternBtn = document.getElementById('demo-intern-btn');
    const demoAdminBtn = document.getElementById('demo-admin-btn');

    // Password Toggle Listeners
    document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (input) {
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
            }
        });
    });

    // 2. Role Selector Toggle
    roleSwitchBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            roleSwitchBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeRole = btn.getAttribute('data-role');

            // Update Labels
            const formattedRole = activeRole === 'admin' ? 'Admin' : 'Intern';
            loginRoleLabel.textContent = formattedRole;
            regRoleLabel.textContent = formattedRole;
            regDeptLabel.textContent = activeRole === 'admin' ? 'Title / Position' : 'Department / Track';
        });
    });

    // 3. Tab Switcher
    tabLoginBtn.addEventListener('click', () => {
        activeTab = 'login';
        tabLoginBtn.classList.add('active');
        tabRegisterBtn.classList.remove('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    });

    tabRegisterBtn.addEventListener('click', () => {
        activeTab = 'register';
        tabRegisterBtn.classList.add('active');
        tabLoginBtn.classList.remove('active');
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
    });

    // 4. Handle Login Form Submit
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        const user = StorageManager.findUserByEmail(email);

        if (!user || user.password !== password) {
            showToast('Invalid email address or password', 'error');
            return;
        }

        if (user.role !== activeRole) {
            showToast(`This account is registered as an ${user.role.toUpperCase()}. Please switch role tabs.`, 'warning');
            return;
        }

        // Successful Login
        StorageManager.setCurrentUser(user);
        showToast(`Welcome back, ${user.name}!`, 'success');

        setTimeout(() => {
            if (user.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'intern-dashboard.html';
            }
        }, 600);
    });

    // 5. Handle Registration Form Submit
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const dept = document.getElementById('reg-dept').value.trim();
        const password = document.getElementById('reg-password').value;

        if (StorageManager.findUserByEmail(email)) {
            showToast('An account with this email already exists.', 'error');
            return;
        }

        const newUser = {
            id: 'u-' + Date.now(),
            name: name,
            email: email,
            password: password,
            role: activeRole,
            department: dept,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
            joinedDate: new Date().toISOString().split('T')[0]
        };

        StorageManager.addUser(newUser);
        StorageManager.setCurrentUser(newUser);

        showToast('Account created successfully!', 'success');

        setTimeout(() => {
            if (newUser.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'intern-dashboard.html';
            }
        }, 600);
    });

    // 6. Fast Demo Login Handlers
    demoInternBtn.addEventListener('click', () => {
        // Switch role switch to intern
        roleSwitchBtns[0].click();
        document.getElementById('login-email').value = 'alex@intern.com';
        document.getElementById('login-password').value = 'password123';
        loginForm.dispatchEvent(new Event('submit'));
    });

    demoAdminBtn.addEventListener('click', () => {
        // Switch role switch to admin
        roleSwitchBtns[1].click();
        document.getElementById('login-email').value = 'admin@company.com';
        document.getElementById('login-password').value = 'admin123';
        loginForm.dispatchEvent(new Event('submit'));
    });
});
