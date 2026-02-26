document.addEventListener('DOMContentLoaded', () => {

    // --- Navbar Sticky ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar?.classList.add('sticky');
        } else {
            navbar?.classList.remove('sticky');
        }
    });

    // --- Active Link Observer ---
    const sections = document.querySelectorAll('section, footer');
    const navLinksList = document.querySelectorAll('.nav-links a');

    const observerOptions = {
        threshold: 0.3,
        rootMargin: "-10% 0px -40% 0px"
    };

    const activeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinksList.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${entry.target.id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => activeObserver.observe(section));

    // --- Fade-In On Scroll ---
    const fadeElements = document.querySelectorAll('.fade-up');
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });

    fadeElements.forEach(el => fadeObserver.observe(el));

    // --- Info Modal Logic ---
    const modal = document.getElementById('infoModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDescription');
    const modalPrice = document.getElementById('modalPriceTag');
    const modalFooter = document.getElementById('modalFooter');
    const infoTriggers = document.querySelectorAll('.info-trigger');
    const closeBtn = document.querySelector('.modal-close');

    infoTriggers.forEach(item => {
        item.addEventListener('click', () => {
            const title = item.getAttribute('data-title');
            const info = item.getAttribute('data-info');
            const price = item.getAttribute('data-price');
            
            if (title && info) {
                modalTitle.textContent = title;
                modalDesc.textContent = info;
                
                // Handle Price Tag
                if (price) {
                    modalPrice.textContent = price;
                    modalPrice.style.display = 'block';
                    modalFooter.style.display = 'block';
                } else {
                    modalPrice.style.display = 'none';
                    modalFooter.style.display = 'none';
                }

                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; 
            }
        });
    });

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    closeBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // --- Smooth Scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                const offset = 100;
                window.scrollTo({
                    top: target.offsetTop - offset,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Form Handlers ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Mesajul a fost recepționat. Te vom contacta în curând.');
            contactForm.reset();
        });
    }
});
