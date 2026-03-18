document.addEventListener('DOMContentLoaded', () => {
    // Banner Logic
    const banner = document.getElementById('announcementBanner');
    const bannerCloseBtn = document.querySelector('.banner-close');

    if (bannerCloseBtn && banner) {
        bannerCloseBtn.addEventListener('click', () => {
            banner.style.display = 'none';
        });
    }

    // Mock Data for Tenders
    const tenders = [
        {
            id: 't-1',
            title: "Smart City Infrastructure Development",
            description: "Implementation of IoT sensors, smart lighting, and unified public dashboard for metropolitan area.",
            value: "$12.5M",
            category: "Technology",
            deadline: "14 days left",
            agency: "Dept. of Urban Planning"
        },
        {
            id: 't-2',
            title: "National Healthcare Database Migration",
            description: "Secure migration of encrypted patient records to a cloud-native unified distributed database system.",
            value: "$8.2M",
            category: "Technology",
            deadline: "5 days left",
            agency: "Ministry of Health"
        },
        {
            id: 't-3',
            title: "Next-Gen Defense Logistics Software",
            description: "Provide comprehensive supply chain visualization tools with predictive machine learning capabilities.",
            value: "$45.0M",
            category: "Defense",
            deadline: "30 days left",
            agency: "Department of Defense"
        },
        {
            id: 't-4',
            title: "Public Transit Mobile App Redesign",
            description: "Complete UI/UX overhaul of the existing public transit mobile application focusing on accessibility.",
            value: "$450K",
            category: "Design",
            deadline: "12 days left",
            agency: "City Transit Authority"
        },
        {
            id: 't-5',
            title: "Renewable Energy Grid Assessment",
            description: "Consultancy services for evaluating the integration of solar and wind inputs into the national grid.",
            value: "$2.1M",
            category: "Consulting",
            deadline: "8 days left",
            agency: "Energy Commission"
        },
        {
            id: 't-6',
            title: "Campus-Wide Wi-Fi 6 Upgrade",
            description: "Hardware provisioning and installation of enterprise-grade Wi-Fi 6 access points across 4 campuses.",
            value: "$1.8M",
            category: "Technology",
            deadline: "3 days left",
            agency: "State University"
        }
    ];

    // =========================================
    // Supabase Initialization
    // =========================================
    const SUPABASE_URL = 'https://upthgeczooqjlzgzhnnw.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_zDc3iJWAiGfnb-PBpQCldQ_CrdO0cP4';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // =========================================
    // SPA Application Logic
    // =========================================
    window.app = {
        state: {
            user: null, // will be populated by Supabase
            myBids: JSON.parse(localStorage.getItem('tenderBids')) || [],
            savedTenders: JSON.parse(localStorage.getItem('tenderSaved')) || [],
            currentTender: null // currently viewed tender
        },

        async init() {
            this.bindEvents();
            await this.checkAuth();
            this.setupAuthListener();
            this.renderLandingTenders();
            
            // Set initial view based on current page
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            if (currentPage === 'dashboard.html' && this.state.user) {
                this.navigate('view-dashboard');
            } else if (currentPage === 'login.html') {
                this.navigate('view-login');
            } else if (currentPage === 'index.html' || currentPage === '') {
                this.navigate('view-landing');
            }

            // Make body visible after initialization (handles FOUC prevention)
            document.body.classList.add('auth-checked');
        },

        setupAuthListener() {
            supabase.auth.onAuthStateChange((event, session) => {
                const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                if (event === 'SIGNED_IN') {
                    this.state.user = session.user;
                    this.updateUserProfileUI();
                    if (currentPage !== 'dashboard.html') {
                        window.location.href = 'dashboard.html';
                    }
                } else if (event === 'SIGNED_OUT') {
                    this.state.user = null;
                    if (currentPage === 'dashboard.html') {
                        window.location.href = 'login.html';
                    }
                }
            });
        },

        updateUserProfileUI() {
            if (!this.state.user) return;
            
            const email = this.state.user.email;
            const initials = email ? email.substring(0, 2).toUpperCase() : 'US';
            const name = this.state.user.user_metadata?.company_name || 'User';

            // Update Sidebar
            const sidebarAvatar = document.querySelector('.user-avatar');
            const sidebarName = document.querySelector('.user-name');
            if (sidebarAvatar) sidebarAvatar.textContent = initials;
            if (sidebarName) sidebarName.textContent = name;

            // Update Profile Page
            const profileInitials = document.getElementById('profileInitials');
            const profileName = document.getElementById('profileName');
            const profileEmail = document.getElementById('profileEmail');
            const profileCompany = document.getElementById('profileCompanyName');
            
            if (profileInitials) profileInitials.textContent = initials;
            if (profileName) profileName.textContent = name;
            if (profileEmail) profileEmail.textContent = email;
            if (profileCompany) profileCompany.value = name;
            
            // Update Welcome banner
            const welcomeBanner = document.querySelector('.welcome-banner h2');
            if (welcomeBanner) welcomeBanner.textContent = `Welcome back, ${name}! 👋`;
        },

        bindEvents() {
            // Landing Nav Buttons
            const navLoginBtn = document.getElementById('navLoginBtn');
            const navRegisterBtn = document.getElementById('navRegisterBtn');
            
            if (navLoginBtn) navLoginBtn.addEventListener('click', () => this.navigate('view-login'));
            if (navRegisterBtn) navRegisterBtn.addEventListener('click', () => this.navigate('view-login')); // mock

            // Login Form
            const loginForm = document.getElementById('loginForm');
            const backToHomeBtn = document.getElementById('backToHomeBtn');
            
            if (loginForm) {
                loginForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleLogin();
                });
            }
            if (backToHomeBtn) backToHomeBtn.addEventListener('click', () => this.navigate('view-landing'));

            // View Toggles
            const goToRegisterBtn = document.getElementById('goToRegisterBtn');
            const goToLoginBtn = document.getElementById('goToLoginBtn');
            
            if (goToRegisterBtn) {
                goToRegisterBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.navigate('view-register');
                });
            }
            if (goToLoginBtn) {
                goToLoginBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.navigate('view-login');
                });
            }

            // Register Form
            const registerForm = document.getElementById('registerForm');
            const backToHomeFromRegBtn = document.getElementById('backToHomeFromRegBtn');
            
            if (registerForm) {
                registerForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleRegister();
                });
            }
            if (backToHomeFromRegBtn) backToHomeFromRegBtn.addEventListener('click', () => this.navigate('view-landing'));

            // Sidebar Navigation
            document.querySelectorAll('.nav-item[data-target]').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    this.navigate(e.currentTarget.getAttribute('data-target'));
                });
            });

            // Logout
            const logoutBtn = document.getElementById('sidebarLogoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleLogout();
                });
            }

            // Mobile Menu
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            const sidebar = document.querySelector('.sidebar');
            if (mobileMenuBtn && sidebar) {
                mobileMenuBtn.addEventListener('click', () => {
                    sidebar.classList.toggle('open');
                });
            }

            // Search Tenders Filter
            const searchInput = document.getElementById('appSearchInput');
            const catFilter = document.getElementById('appCategoryFilter');
            
            if (searchInput) searchInput.addEventListener('input', () => this.renderAppTenders());
            if (catFilter) catFilter.addEventListener('change', () => this.renderAppTenders());

            // Bid Form
            const bidForm = document.getElementById('bidForm');
            if (bidForm) {
                bidForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.submitBid();
                });
            }
            
            const cancelBidBtn = document.getElementById('cancelBidBtn');
            if (cancelBidBtn) {
                cancelBidBtn.addEventListener('click', () => this.navigate('view-tender-detail'));
            }

            const bakeToDetailBtn = document.getElementById('backToDetailBtn');
            if (bakeToDetailBtn) {
                bakeToDetailBtn.addEventListener('click', () => this.navigate('view-tender-detail'));
            }

            // Detail Page Actions
            const applyBtn = document.getElementById('applyBtn');
            if (applyBtn) {
                applyBtn.addEventListener('click', () => {
                    if (this.state.currentTender) {
                        document.getElementById('applyTenderTitle').textContent = this.state.currentTender.title;
                        this.navigate('view-apply');
                    }
                });
            }

            const saveTenderBtn = document.getElementById('saveTenderBtn');
            if (saveTenderBtn) {
                saveTenderBtn.addEventListener('click', () => {
                    this.toggleSaveCurrentTender();
                });
            }
        },

        async checkAuth() {
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    this.state.user = session.user;
                    this.updateUserProfileUI();
                    if (currentPage !== 'dashboard.html') {
                        window.location.href = 'dashboard.html';
                    }
                } else {
                    if (currentPage === 'dashboard.html') {
                        window.location.href = 'login.html';
                    }
                }
            } catch (error) {
                console.error("Error checking auth session:", error);
                if (currentPage === 'dashboard.html') {
                    window.location.href = 'login.html';
                }
            }
        },

        async handleLogin() {
            const email = document.getElementById('username').value;
            const pass = document.getElementById('password').value;
            const errorEl = document.getElementById('loginError');
            const btn = document.querySelector('#loginForm button[type="submit"]');

            errorEl.classList.add('hidden');
            btn.textContent = 'Logging in...';
            btn.disabled = true;

            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: pass,
                });

                if (error) throw error;
                
                // Form reset happens on succcessful auth state change
                document.getElementById('loginForm').reset();
            } catch (error) {
                errorEl.textContent = error.message || 'Invalid credentials. Please try again.';
                errorEl.classList.remove('hidden');
            } finally {
                btn.textContent = 'Login to Account';
                btn.disabled = false;
            }
        },

        async handleRegister() {
            const email = document.getElementById('regEmail').value;
            const pass = document.getElementById('regPassword').value;
            const company = document.getElementById('regCompany').value;
            
            const errorEl = document.getElementById('registerError');
            const successEl = document.getElementById('registerSuccess');
            const btn = document.querySelector('#registerForm button[type="submit"]');

            errorEl.classList.add('hidden');
            successEl.classList.add('hidden');
            btn.textContent = 'Creating Account...';
            btn.disabled = true;

            try {
                const { data, error } = await supabase.auth.signUp({
                    email: email,
                    password: pass,
                    options: {
                        data: {
                            company_name: company
                        },
                        emailRedirectTo: window.location.origin + '/verify.html'
                    }
                });

                if (error) throw error;
                
                successEl.classList.remove('hidden');
                document.getElementById('registerForm').reset();
                
                // If auto setup is true but we need email confirmation, it won't auto sign in.
                if (data.user && data.session) {
                    // Auto signed in
                } else {
                    // Inform user to check email if confirmation is required
                    successEl.textContent = 'Registration successful! Please check your email to confirm your account before logging in.';
                }
            } catch (error) {
                errorEl.textContent = error.message || 'Registration failed. Please try again.';
                errorEl.classList.remove('hidden');
            } finally {
                btn.textContent = 'Create Account';
                btn.disabled = false;
            }
        },

        async handleLogout() {
            try {
                await supabase.auth.signOut();
                // Auth listener will handle the redirect
            } catch (error) {
                console.error('Error logging out:', error);
            }
        },

        navigate(viewId) {
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';

            // Close mobile sidebar if open
            const sidebar = document.querySelector('.sidebar');
            if (sidebar && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }

            // MPA Redirects
            if (viewId === 'view-landing') {
                if (currentPage !== 'index.html' && currentPage !== '') {
                    window.location.href = 'index.html';
                    return;
                }
            } else if (viewId === 'view-login' || viewId === 'view-register') {
                if (currentPage !== 'login.html') {
                    // Let destination page logic handle viewId, or default to login
                    window.location.href = 'login.html';
                    return;
                }
            } else {
                if (currentPage !== 'dashboard.html') {
                    window.location.href = 'dashboard.html';
                    return;
                }
            }

            // Safe DOM manipulations for current page
            document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
            document.querySelectorAll('.app-view').forEach(v => v.classList.add('hidden'));

            const layout = document.getElementById('app-layout');
            if (layout && (viewId === 'view-landing' || viewId === 'view-login' || viewId === 'view-register')) {
                layout.classList.add('hidden');
            } else if (layout) {
                layout.classList.remove('hidden');
            }

            const targetView = document.getElementById(viewId);
            if (targetView) targetView.classList.remove('hidden');

            const landingView = document.getElementById('view-landing');
            if (landingView && viewId !== 'view-landing') landingView.classList.add('hidden');

            // Update Page Title based on view
            const titles = {
                'view-dashboard': 'Dashboard',
                'view-tender-list': 'Search Tenders',
                'view-tender-detail': 'Tender Details',
                'view-apply': 'Submit Proposal',
                'view-my-bids': 'My Bids',
                'view-saved-tenders': 'Saved Tenders',
                'view-profile': 'Company Profile'
            };
            
            const pageTitleEl = document.getElementById('currentPageTitle');
            if (pageTitleEl && titles[viewId]) {
                pageTitleEl.textContent = titles[viewId];
            }

            // Trigger specific render functions based on view
            if (viewId === 'view-dashboard') this.renderDashboard();
            if (viewId === 'view-tender-list') this.renderAppTenders();
            if (viewId === 'view-my-bids') this.renderMyBids();
            if (viewId === 'view-saved-tenders') this.renderSavedTenders();
        },

        openTenderDetails(id) {
            const tender = tenders.find(t => t.id === id);
            if (!tender) return;
            
            this.state.currentTender = tender;
            
            document.getElementById('detailTitle').textContent = tender.title;
            document.getElementById('detailCategory').textContent = tender.category;
            document.getElementById('detailDeadline').textContent = tender.deadline;
            document.getElementById('detailValue').textContent = tender.value;
            document.getElementById('detailAgency').textContent = tender.agency;
            document.getElementById('detailDesc').textContent = tender.description;

            // Update Save Button status
            const saveBtn = document.getElementById('saveTenderBtn');
            if (this.state.savedTenders.includes(tender.id)) {
                saveBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" class="mr-2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg> Saved';
                saveBtn.style.color = 'var(--primary-main)';
                saveBtn.style.borderColor = 'var(--primary-main)';
            } else {
                saveBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg> Save for Later';
                saveBtn.style.color = '';
                saveBtn.style.borderColor = '';
            }

            this.navigate('view-tender-detail');
        },

        toggleSaveCurrentTender() {
            if (!this.state.currentTender) return;
            const tid = this.state.currentTender.id;
            const index = this.state.savedTenders.indexOf(tid);
            
            if (index > -1) {
                // Remove
                this.state.savedTenders.splice(index, 1);
            } else {
                // Add
                this.state.savedTenders.push(tid);
            }
            
            localStorage.setItem('tenderSaved', JSON.stringify(this.state.savedTenders));
            
            // Re-render UI to reflect change
            this.openTenderDetails(tid);
        },

        submitBid() {
            if (!this.state.currentTender) return;
            
            const amount = document.getElementById('bidAmount').value;
            
            const newBid = {
                id: 'b-' + Date.now().toString(36),
                tenderId: this.state.currentTender.id,
                tenderTitle: this.state.currentTender.title,
                amount: amount,
                submittedAt: new Date().toLocaleDateString(),
                status: 'Pending'
            };
            
            this.state.myBids.push(newBid);
            localStorage.setItem('tenderBids', JSON.stringify(this.state.myBids));
            
            // Reset form
            document.getElementById('bidForm').reset();
            
            // Navigate to my bids
            this.navigate('view-my-bids');
        },

        // Render Functions
        renderLandingTenders() {
            const list = document.getElementById('tendersList');
            if (!list) return;
            list.innerHTML = '';
            
            tenders.slice(0, 3).forEach((tender, index) => {
                const card = this.createTenderCardHTML(tender, index, true);
                list.appendChild(card);
            });
        },

        renderDashboard() {
            // Update Stats
            document.getElementById('dashboardSavedCount').textContent = this.state.savedTenders.length;
            
            // Render mini list (latest 2)
            const list = document.getElementById('dashboardTendersList');
            if (!list) return;
            list.innerHTML = '';
            
            tenders.slice(0, 2).forEach(tender => {
                const item = document.createElement('div');
                item.className = 'doc-item';
                item.style.cursor = 'pointer';
                item.innerHTML = `
                    <div style="flex-grow: 1;">
                        <h4 style="color: var(--text-primary); margin-bottom: 4px;">${tender.title}</h4>
                        <span style="font-size: 0.8rem;">${tender.agency} • <span style="color: var(--warning)">${tender.deadline}</span></span>
                    </div>
                    <button class="btn btn-ghost btn-sm">View</button>
                `;
                item.addEventListener('click', () => this.openTenderDetails(tender.id));
                list.appendChild(item);
            });
        },

        renderAppTenders() {
            const grid = document.getElementById('appTendersGrid');
            if (!grid) return;
            
            const search = (document.getElementById('appSearchInput').value || '').toLowerCase();
            const filter = document.getElementById('appCategoryFilter').value || 'all';
            
            grid.innerHTML = '';
            
            let count = 0;
            tenders.forEach((tender) => {
                // Filtering logic
                const matchSearch = tender.title.toLowerCase().includes(search) || tender.description.toLowerCase().includes(search);
                const matchCat = filter === 'all' || tender.category === filter;
                
                if (matchSearch && matchCat) {
                    const card = this.createTenderCardHTML(tender, count, false);
                    grid.appendChild(card);
                    count++;
                }
            });

            if (count === 0) {
                grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">No tenders found matching your criteria.</div>';
            }
        },

        renderMyBids() {
            const tbody = document.getElementById('myBidsTableBody');
            const noRow = document.getElementById('noBidsRow');
            if (!tbody || !noRow) return;
            
            // Clear existing data rows (keep noRow)
            Array.from(tbody.children).forEach(row => {
                if (row.id !== 'noBidsRow') tbody.removeChild(row);
            });
            
            if (this.state.myBids.length === 0) {
                noRow.style.display = 'table-row';
            } else {
                noRow.style.display = 'none';
                
                this.state.myBids.forEach(bid => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td style="font-weight: 500; color: var(--text-primary);">${bid.tenderTitle}</td>
                        <td>$${parseFloat(bid.amount).toLocaleString()}</td>
                        <td>${bid.submittedAt}</td>
                        <td><span class="status-badge status-pending">${bid.status}</span></td>
                        <td>
                            <button class="btn btn-ghost" style="padding: 4px 8px; font-size: 0.8rem;" onclick="app.openTenderDetails('${bid.tenderId}')">View Tender</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        },

        renderSavedTenders() {
            const grid = document.getElementById('savedTendersGrid');
            const noMsg = document.getElementById('noSavedMessage');
            if (!grid || !noMsg) return;
            
            // Clear existing cards
            Array.from(grid.children).forEach(child => {
                if (child.id !== 'noSavedMessage') grid.removeChild(child);
            });
            
            if (this.state.savedTenders.length === 0) {
                noMsg.style.display = 'block';
            } else {
                noMsg.style.display = 'none';
                
                this.state.savedTenders.forEach((tid, i) => {
                    const tender = tenders.find(t => t.id === tid);
                    if (tender) {
                        const card = this.createTenderCardHTML(tender, i, false);
                        grid.appendChild(card);
                    }
                });
            }
        },

        // Helper
        createTenderCardHTML(tender, index, isLanding = false) {
            const delay = index * 100;
            const card = document.createElement('div');
            card.className = 'tender-card';
            if (isLanding) card.classList.add('animate-on-scroll');
            card.style.transitionDelay = `${delay}ms`;

            card.innerHTML = `
                <div class="tender-meta">
                    <span class="tender-tag">${tender.category}</span>
                    <span class="tender-value">${tender.value}</span>
                </div>
                <h3 class="tender-title">${tender.title}</h3>
                <p class="tender-desc">${tender.description}</p>
                <div class="tender-footer">
                    <span class="tender-deadline">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                            <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        ${tender.deadline}
                    </span>
                    <button class="btn btn-ghost" style="padding: 4px 8px; font-size: 0.875rem;">View Details &rarr;</button>
                </div>
            `;
            
            // Event listener to open details instead of hash link
            card.addEventListener('click', () => {
                if (this.state.user || isLanding === false) {
                    this.openTenderDetails(tender.id);
                } else {
                    // Force login if clicked from landing page
                    this.navigate('view-login');
                }
            });

            return card;
        }
    };

    // Initialize SPA
    app.init();

    // Intersection Observer for scroll animations (Landing Page)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe tender cards, category cards, feature columns, and pricing cards
    document.querySelectorAll('.animate-on-scroll, .category-card, .feature-column, .pricing-card, .testimonial-card').forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });

    // Add Keyframe animations dynamically
    const style = document.createElement('style');
    style.textContent = `
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .animate-on-scroll.is-visible {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                navbar.style.background = 'rgba(3, 7, 18, 0.95)';
                navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
            } else {
                navbar.style.background = 'var(--bg-base)';
                navbar.style.boxShadow = 'none';
            }
        });
    }
});
