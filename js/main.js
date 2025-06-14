document.addEventListener('DOMContentLoaded', () => {

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Intersection Observer for scroll animations
    const animatedSections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    animatedSections.forEach(section => {
        section.classList.add('fade-in-initial');
        observer.observe(section);
    });

    // Scroll Spy for active navigation links
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    const mobileNavLinks = document.querySelectorAll('#mobileMenu a[href^="#"]');

    const onScroll = () => {
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 150) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active-nav-link');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active-nav-link');
            }
        });
        mobileNavLinks.forEach(link => {
            link.classList.remove('active-nav-link');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active-nav-link');
            }
        });
    };

    window.addEventListener('scroll', onScroll);
    onScroll(); // Initial check

    // Contact Form Submission Feedback
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const modal = document.getElementById('feedbackModal');
            if (modal) {
                modal.classList.add('active');
                setTimeout(() => {
                    modal.classList.remove('active');
                    contactForm.reset();
                }, 3000);
            }
        });
    }
});
