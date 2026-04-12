document.addEventListener("DOMContentLoaded", () => {

    // 0. Scroll Progress Bar + Navbar shadow on scroll
    const scrollBar = document.getElementById('scroll-progress');
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        if (scrollBar) scrollBar.style.width = progress + '%';
        if (navbar) navbar.classList.toggle('scrolled', scrollTop > 20);
    }, { passive: true });

    // 1. Intersection Observer for fade-in animations on scroll
    const observerOptions = {
        threshold: 0.05,
        rootMargin: "0px 0px 0px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const elementsToAnimate = document.querySelectorAll(
        '.hero-content, .section-title, .skill-card, .project-card, .footer-content, .about-content, .timeline-item, .stat-box'
    );
    elementsToAnimate.forEach((el, index) => {
        el.classList.add('fade-in');

        if (el.classList.contains('skill-card') || el.classList.contains('project-card') ||
            el.classList.contains('timeline-item') || el.classList.contains('stat-box')) {
            el.style.transitionDelay = `${(index % 4) * 0.08}s`;
        }

        observer.observe(el);
    });

    // 2. Typing Effect for Hero Title
    const typingText = document.querySelector('.typing-text');
    const words = ["digital experiences.", "scalable web apps.", "intuitive interfaces.", "clean code."];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        if (!typingText) return;
        const currentWord = words[wordIndex];

        if (isDeleting) {
            typingText.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingText.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentWord.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }

    if (typingText) {
        setTimeout(type, 1000);
    }

    // 3. Mouse Tracking Spotlight Effect for Cards
    const cards = document.querySelectorAll('.skill-card, .project-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // 4. Smooth Scrolling for internal Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // 5. Hamburger Mobile Menu
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    const navOverlay = document.getElementById('nav-overlay');
    const navCloseBtn = document.getElementById('nav-close');

    function openMenu() {
        mobileNav.classList.add('open');
        hamburger.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        if (navOverlay) { navOverlay.style.display = 'block'; requestAnimationFrame(() => navOverlay.classList.add('active')); }
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        if (navOverlay) {
            navOverlay.classList.remove('active');
            setTimeout(() => { navOverlay.style.display = 'none'; }, 300);
        }
        document.body.style.overflow = '';
    }

    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', () => {
            mobileNav.classList.contains('open') ? closeMenu() : openMenu();
        });

        if (navCloseBtn) navCloseBtn.addEventListener('click', closeMenu);
        if (navOverlay) navOverlay.addEventListener('click', closeMenu);

        mobileNav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }

});
