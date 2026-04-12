document.addEventListener("DOMContentLoaded", () => {
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

    // Select all elements that need to fade in
    const elementsToAnimate = document.querySelectorAll(
        '.hero-content, .section-title, .skill-card, .project-card, .footer-content, .about-content, .timeline-item, .stat-box'
    );
    elementsToAnimate.forEach((el, index) => {
        el.classList.add('fade-in');
        
        // Add a slight stagger to grid items
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
        if(!typingText) return;

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
            typeSpeed = 2000; // Pause at the end of the word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500; // Pause before typing next word
        }

        setTimeout(type, typeSpeed);
    }
    
    // Start typing effect after a small delay
    if(typingText) {
        setTimeout(type, 1000);
    }

    // 3. Mouse Tracking Spotlight Effect for Cards
    const cards = document.querySelectorAll('.skill-card, .project-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            // Calculate mouse position relative to the card
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Set custom properties for the CSS radial gradient
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // 4. Smooth Scrolling for internal Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
