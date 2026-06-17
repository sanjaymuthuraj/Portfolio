document.addEventListener("DOMContentLoaded", () => {

    // 0. Scroll Progress Bar
    const scrollBar = document.getElementById('scroll-progress');
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        if (scrollBar) scrollBar.style.width = progress + '%';
    }, { passive: true });

    // 1. Scrollspy: Active Navigation Link Highlight
    const sections = document.querySelectorAll('.scroll-section, #profile-summary');
    const navLinks = document.querySelectorAll('.content-nav .nav-links a');

    function highlightActiveSection() {
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 120; // offset for sticky header

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        // Special case: if at the bottom of the page, highlight Contact
        if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 10) {
            currentSectionId = 'contact';
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            // Check if link targets this section
            const target = link.getAttribute('href');
            if (target === `#${currentSectionId}` || (currentSectionId === 'profile-summary' && target === '#about')) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', highlightActiveSection);
    highlightActiveSection(); // Initialize on load

    // 2. Intersection Observer for fade-in animations on scroll
    const observerOptions = {
        threshold: 0.05,
        rootMargin: "0px 0px -20px 0px"
    };

    function animateCounter(element) {
        const targetEl = element.querySelector('.stat-number');
        if (!targetEl) return;
        const targetVal = parseInt(targetEl.getAttribute('data-target'), 10);
        if (isNaN(targetVal)) return;

        const duration = 1500; // 1.5 seconds
        const startTime = performance.now();

        function update(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(easeProgress * targetVal);

            targetEl.textContent = currentVal;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                targetEl.textContent = targetVal;
            }
        }
        requestAnimationFrame(update);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                
                // Animate stats when visible
                if (entry.target.classList.contains('stat-card')) {
                    animateCounter(entry.target);
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const elementsToAnimate = document.querySelectorAll(
        '.about-text, .stat-card, .timeline-item, .project-item-card, .education-item, .activity-bullet-item, .footer-content, .capsule-container, .languages-container'
    );
    
    elementsToAnimate.forEach((el, index) => {
        // Only add fade-in class to non-container structural elements
        if (!el.classList.contains('capsule-container') && !el.classList.contains('languages-container')) {
            el.classList.add('fade-in');
        }

        if (el.classList.contains('stat-card') || el.classList.contains('project-item-card') || el.classList.contains('activity-bullet-item')) {
            el.style.transitionDelay = `${(index % 3) * 0.08}s`;
        } else if (el.classList.contains('timeline-item')) {
            el.style.transitionDelay = `${(index % 2) * 0.12}s`;
        }

        observer.observe(el);
    });

    // 3. Typing Effect for Hero Title
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

        let typeSpeed = isDeleting ? 40 : 80;

        if (!isDeleting && charIndex === currentWord.length) {
            typeSpeed = 1800; // Stay at full word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 400; // Delay before typing next word
        }

        setTimeout(type, typeSpeed);
    }

    if (typingText) {
        setTimeout(type, 1000);
    }

    // 4. Smooth Scrolling for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerOffset = 80; // sticky navbar height
                const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 5. Mouse spotlight effect on project cards
    const projectCards = document.querySelectorAll('.project-item-card');
    projectCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

});
