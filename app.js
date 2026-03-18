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
            id: 1,
            title: "Smart City Infrastructure Development",
            description: "Implementation of IoT sensors, smart lighting, and unified public dashboard for metropolitan area.",
            value: "$12.5M",
            category: "Technology",
            deadline: "14 days left"
        },
        {
            id: 2,
            title: "National Healthcare Database Migration",
            description: "Secure migration of encrypted patient records to a cloud-native unified distributed database system.",
            value: "$8.2M",
            category: "IT / Data",
            deadline: "5 days left"
        },
        {
            id: 3,
            title: "Next-Gen Defense Logistics Software",
            description: "Provide comprehensive supply chain visualization tools with predictive machine learning capabilities.",
            value: "$45.0M",
            category: "Defense",
            deadline: "30 days left"
        },
        {
            id: 4,
            title: "Public Transit Mobile App Redesign",
            description: "Complete UI/UX overhaul of the existing public transit mobile application focusing on accessibility.",
            value: "$450K",
            category: "Design",
            deadline: "12 days left"
        },
        {
            id: 5,
            title: "Renewable Energy Grid Assessment",
            description: "Consultancy services for evaluating the integration of solar and wind inputs into the national grid.",
            value: "$2.1M",
            category: "Consulting",
            deadline: "8 days left"
        },
        {
            id: 6,
            title: "Campus-Wide Wi-Fi 6 Upgrade",
            description: "Hardware provisioning and installation of enterprise-grade Wi-Fi 6 access points across 4 campuses.",
            value: "$1.8M",
            category: "Networking",
            deadline: "3 days left"
        }
    ];

    const tendersList = document.getElementById('tendersList');

    // Populate Tenders
    if (tendersList) {
        tenders.forEach((tender, index) => {
            const delay = index * 100;
            const card = document.createElement('div');
            card.className = 'tender-card';
            // Use Intersection Observer for animation instead of immediate delay
            card.classList.add('animate-on-scroll');
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

            tendersList.appendChild(card);
        });
    }

    // Intersection Observer for scroll animations
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
                // If banner is visible, maybe adjust navbar top position, but sticky handles this usually if not fixed.
                // Since it's sticky, we don't need to change top.
            } else {
                navbar.style.background = 'var(--bg-base)';
                navbar.style.boxShadow = 'none';
            }
        });
    }
});
