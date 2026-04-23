document.addEventListener('DOMContentLoaded', () => {
    // Auth & Layout elements
    const authSection = document.getElementById('auth-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const linksSection = document.getElementById('links-section');
    const navbar = document.getElementById('navbar');
    const welcomeMsg = document.getElementById('welcome-msg');

    // Nav elements
    const navDashboard = document.getElementById('nav-dashboard');
    const navLinks = document.getElementById('nav-links');
    const logoutBtn = document.getElementById('logout-btn');

    // Auth forms
    const authForm = document.getElementById('auth-form');
    const authBtn = document.getElementById('auth-btn');
    const authError = document.getElementById('auth-error');
    const toggleAuthBtn = document.getElementById('toggle-auth-btn');
    const authToggleText = document.getElementById('auth-toggle-text');

    let isLogin = true;

    // Dashboard elements
    const shortenForm = document.getElementById('shorten-form');
    const urlInput = document.getElementById('url-input');
    const platformInput = document.getElementById('platform-input');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');
    const errorMessage = document.getElementById('error-message');
    const resultContainer = document.getElementById('result-container');
    const shortenedUrl = document.getElementById('shortened-url');
    const copyBtn = document.getElementById('copy-btn');

    // Stats & Links elements
    const linksList = document.getElementById('links-list');
    const statsContainer = document.getElementById('stats-container');
    const totalClicksEl = document.getElementById('total-clicks');
    const platformStatsList = document.getElementById('platform-stats');

    // Check auth status on load
    checkAuth();

    async function checkAuth() {
        try {
            const res = await fetch('http://localhost:3000/api/me');
            if (res.ok) {
                const data = await res.json();
                showApp(data.username);
            } else {
                showAuth();
            }
        } catch (e) {
            showAuth();
        }
    }

    function showApp(username) {
        authSection.classList.add('hidden');
        navbar.classList.remove('hidden');
        welcomeMsg.textContent = `Hello, ${username}`;

        // Show dashboard by default
        showDashboardPage();
        loadLinks();
    }

    function showAuth() {
        authSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
        linksSection.classList.add('hidden');
        navbar.classList.add('hidden');
    }

    // Navigation logic
    navDashboard.addEventListener('click', (e) => {
        e.preventDefault();
        showDashboardPage();
    });

    navLinks.addEventListener('click', (e) => {
        e.preventDefault();
        showLinksPage();
        loadLinks(); // Refresh when opening tab
    });

    function showDashboardPage() {
        dashboardSection.classList.remove('hidden');
        linksSection.classList.add('hidden');
        navDashboard.classList.add('active');
        navLinks.classList.remove('active');
    }

    function showLinksPage() {
        dashboardSection.classList.add('hidden');
        linksSection.classList.remove('hidden');
        navLinks.classList.add('active');
        navDashboard.classList.remove('active');
    }

    // Auth toggler
    toggleAuthBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isLogin = !isLogin;
        authBtn.textContent = isLogin ? 'Login' : 'Sign Up';
        authToggleText.textContent = isLogin ? "Don't have an account?" : "Already have an account?";
        toggleAuthBtn.textContent = isLogin ? 'Sign up' : 'Login';
        authError.classList.add('hidden');
    });

    // Auth submit
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        authError.classList.add('hidden');

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const endpoint = isLogin ? 'http://localhost:3000/login' : 'http://localhost:3000/signup';

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await res.json();

            if (res.ok) {
                showApp(data.username);
                authForm.reset();
            } else {
                authError.textContent = data.error || 'Authentication failed';
                authError.classList.remove('hidden');
            }
        } catch (e) {
            authError.textContent = 'Network error: Unable to connect to server';
            authError.classList.remove('hidden');
        }
    });

    // Logout
    logoutBtn.addEventListener('click', async () => {
        await fetch('http://localhost:3000/api/logout', { method: 'POST' });
        showAuth();
    });

    // Load Links
    async function loadLinks() {
        try {
            const res = await fetch('http://localhost:3000/api/links');
            if (res.ok) {
                const links = await res.json();
                renderStats(links);
                renderLinks(links);
            }
        } catch (e) {
            console.error('Failed to load links');
        }
    }

    function renderStats(links) {
        if (links.length === 0) {
            statsContainer.classList.add('hidden');
            return;
        }

        statsContainer.classList.remove('hidden');

        let totalClicks = 0;
        let maxClicks = -1;
        let bestPlatform = 'N/A';
        const platformCounts = {
            'WhatsApp': 0,
            'Instagram': 0,
            'TikTok': 0,
            'Facebook': 0,
            'Other': 0
        };

        links.forEach(link => {
            totalClicks += link.clicks;
            if (platformCounts[link.platform] !== undefined) {
                platformCounts[link.platform] += link.clicks;
            } else {
                platformCounts['Other'] += link.clicks;
            }
        });

        totalClicksEl.textContent = totalClicks;

        platformStatsList.innerHTML = '';
        for (const [platform, count] of Object.entries(platformCounts)) {
            if (count > maxClicks && count > 0) {
                maxClicks = count;
                bestPlatform = platform;
            }
            if (count > 0 || platform !== 'Other') {
                const li = document.createElement('li');
                li.innerHTML = `<span>${platform}</span> <strong>${count}</strong>`;
                platformStatsList.appendChild(li);
            }
        }

        document.getElementById('top-platform').textContent = totalClicks > 0 ? bestPlatform : 'N/A';
    }

    function renderLinks(links) {
        linksList.innerHTML = '';
        if (links.length === 0) {
            linksList.innerHTML = "<p class='empty-msg'>You haven't created any short links yet.</p>";
            return;
        }

        links.forEach(link => {
            const div = document.createElement('div');
            div.className = 'link-item';
            div.innerHTML = `
                <div class="link-info">
                    <a href="${link.shortUrl}" target="_blank" class="short-link">${link.shortUrl}</a>
                    <span class="original-link">${link.originalUrl}</span>
                </div>
                <div class="link-stats">
                    <span class="platform-badge">${link.platform}</span>
                    <span class="clicks-badge">${link.clicks} clicks</span>
                </div>
            `;
            linksList.appendChild(div);
        });
    }

    // Shorten URL
    shortenForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const originalUrl = urlInput.value.trim();
        const platform = platformInput.value;
        if (!originalUrl) return;

        errorMessage.classList.add('hidden');
        resultContainer.classList.add('hidden');
        btnText.classList.add('hidden');
        spinner.classList.remove('hidden');
        submitBtn.disabled = true;

        try {
            const response = await fetch('http://localhost:3000/api/shorten', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ originalUrl, platform })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Failed to shorten URL');

            shortenedUrl.href = data.shortUrl;
            shortenedUrl.textContent = data.shortUrl;
            resultContainer.classList.remove('hidden');
            urlInput.value = '';

            // Reload links to show the new one in stats
            loadLinks();

        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.classList.remove('hidden');
        } finally {
            btnText.classList.remove('hidden');
            spinner.classList.add('hidden');
            submitBtn.disabled = false;
        }
    });

    // Copy to clipboard
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(shortenedUrl.href);
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => copyBtn.textContent = originalText, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    });
});
