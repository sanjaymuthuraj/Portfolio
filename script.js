document.addEventListener("DOMContentLoaded", () => {

    // 0. Scroll Progress Bar & Scrollspy setup
    const scrollBar = document.getElementById('scroll-progress');
    const sections = document.querySelectorAll('.scroll-section, #profile-summary');
    const navLinks = document.querySelectorAll('.content-nav .nav-links a');

    let sectionPositions = [];

    // Cache section layout metrics to avoid reading layout properties on every scroll tick
    function cacheSectionPositions() {
        sectionPositions = Array.from(sections).map(section => ({
            id: section.getAttribute('id'),
            top: section.offsetTop,
            height: section.offsetHeight
        }));
    }

    cacheSectionPositions();
    window.addEventListener('load', cacheSectionPositions);
    window.addEventListener('resize', cacheSectionPositions);

    function highlightActiveSection(scrollTop) {
        let currentSectionId = '';
        const scrollPosition = scrollTop + 120; // offset for sticky header

        for (let i = 0; i < sectionPositions.length; i++) {
            const section = sectionPositions[i];
            if (scrollPosition >= section.top && scrollPosition < section.top + section.height) {
                currentSectionId = section.id;
                break;
            }
        }

        // Special case: if at the bottom of the page, highlight Contact
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollTop >= docHeight - 10) {
            currentSectionId = 'contact';
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            const target = link.getAttribute('href');
            if (target === `#${currentSectionId}` || (currentSectionId === 'profile-summary' && target === '#about')) {
                link.classList.add('active');
            }
        });
    }

    // Throttle scroll events using requestAnimationFrame for smooth 60fps updates
    let scrollTicking = false;

    function handleScroll() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        
        if (scrollBar) {
            scrollBar.style.width = progress + '%';
        }
        
        highlightActiveSection(scrollTop);
    }

    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            window.requestAnimationFrame(() => {
                handleScroll();
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });

    // Initial check on load
    handleScroll();

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

    // 5. Mouse spotlight effect on project cards (caching bounding rect & throttled mousemove)
    const projectCards = document.querySelectorAll('.project-item-card');
    projectCards.forEach(card => {
        let rect = null;
        let mouseTicking = false;

        card.addEventListener('mouseenter', () => {
            rect = card.getBoundingClientRect();
        });

        card.addEventListener('mouseleave', () => {
            rect = null;
        });

        card.addEventListener('mousemove', (e) => {
            if (!rect) {
                rect = card.getBoundingClientRect();
            }
            if (!mouseTicking) {
                window.requestAnimationFrame(() => {
                    if (rect) {
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        card.style.setProperty('--mouse-x', `${x}px`);
                        card.style.setProperty('--mouse-y', `${y}px`);
                    }
                    mouseTicking = false;
                });
                mouseTicking = true;
            }
        });
    });

    // 6. Interactive Full-Page Constellation / Spider Web Canvas Animation
    const canvas = document.getElementById('page-web-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const particles = [];
        const maxParticles = 75; // Balanced density for full screen coverage
        const connectionDist = 100;
        let mouse = { x: null, y: null, active: false };

        let cachedSidebarRect = null;
        let cachedAvatarRect = null;

        // Helper to check if coordinates are over the dark sidebar area for contrast adaptations
        function isOverSidebar(x, y) {
            if (window.innerWidth > 1024) {
                return cachedSidebarRect ? x < cachedSidebarRect.right : false;
            } else {
                if (cachedAvatarRect && y < cachedAvatarRect.bottom) {
                    return true;
                }
                return cachedSidebarRect ? y > cachedSidebarRect.top : false;
            }
        }

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.35;
                this.vy = (Math.random() - 0.5) * 0.35;
                this.radius = Math.random() * 1.5 + 1;
            }

            update() {
                // Apply steering attraction towards the cursor coordinates
                if (mouse.active && mouse.x !== null && mouse.y !== null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const attractionRadius = 180;

                    if (dist < attractionRadius) {
                        const force = (attractionRadius - dist) / attractionRadius * 0.45;
                        // Steer velocity towards the target coordinate
                        this.vx += (dx / (dist || 1)) * force * 0.08;
                        this.vy += (dy / (dist || 1)) * force * 0.08;
                    }
                }

                // Damping/friction to stabilize velocity orbits
                this.vx *= 0.97;
                this.vy *= 0.97;

                // Max speed limit
                const maxSpeed = 1.25;
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed > maxSpeed) {
                    this.vx = (this.vx / speed) * maxSpeed;
                    this.vy = (this.vy / speed) * maxSpeed;
                }

                // If speed falls too low, bump it to maintain gentle random drift
                if (speed < 0.15) {
                    this.vx += (Math.random() - 0.5) * 0.08;
                    this.vy += (Math.random() - 0.5) * 0.08;
                }

                // Move position
                this.x += this.vx;
                this.y += this.vy;

                // Bounce from canvas edges
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                if (isOverSidebar(this.x, this.y)) {
                    ctx.fillStyle = 'rgba(56, 239, 125, 0.6)'; // neon green for dark sidebar
                } else {
                    ctx.fillStyle = 'rgba(21, 128, 61, 0.5)'; // forest green for light content area
                }
                ctx.fill();
            }
        }

        function initParticles() {
            particles.length = 0;
            for (let i = 0; i < maxParticles; i++) {
                particles.push(new Particle());
            }
        }

        function resizeCanvas() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
        }

        window.addEventListener('resize', resizeCanvas);
        initParticles();

        // Track cursor coordinates across entire viewport
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            mouse.active = true;
        });

        window.addEventListener('mouseleave', () => {
            mouse.active = false;
        });

        function animate() {
            ctx.clearRect(0, 0, width, height);

            // Cache rects once per frame to prevent layout thrashing inside isOverSidebar
            const sidebarEl = document.querySelector('.sidebar');
            cachedSidebarRect = sidebarEl ? sidebarEl.getBoundingClientRect() : null;
            const avatarEl = document.querySelector('.avatar-block');
            cachedAvatarRect = avatarEl ? avatarEl.getBoundingClientRect() : null;

            // Update & draw particles
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // Draw connecting web lines
            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDist) {
                        const alpha = (1 - dist / connectionDist) * 0.18;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        
                        // Adapt connection line color depending on area
                        if (isOverSidebar(p1.x, p1.y) || isOverSidebar(p2.x, p2.y)) {
                            ctx.strokeStyle = `rgba(56, 239, 125, ${alpha})`;
                        } else {
                            ctx.strokeStyle = `rgba(21, 128, 61, ${alpha * 1.25})`;
                        }
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }

                // Connect particles to mouse cursor
                if (mouse.active && mouse.x !== null && mouse.y !== null) {
                    const dx = p1.x - mouse.x;
                    const dy = p1.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDist * 1.5) {
                        const alpha = (1 - dist / (connectionDist * 1.5)) * 0.32;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        if (isOverSidebar(p1.x, p1.y) || isOverSidebar(mouse.x, mouse.y)) {
                            ctx.strokeStyle = `rgba(56, 239, 125, ${alpha})`;
                        } else {
                            ctx.strokeStyle = `rgba(21, 128, 61, ${alpha * 1.25})`;
                        }
                        ctx.lineWidth = 1.0;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(animate);
        }

        animate();
    }

});
