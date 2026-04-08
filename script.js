document.addEventListener("DOMContentLoaded", () => {
    
    
    const yearSpan = document.getElementById("current-year");
    if(yearSpan) yearSpan.textContent = new Date().getFullYear();

    
    const navbar = document.getElementById("navbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) navbar.classList.add("scrolled");
        else navbar.classList.remove("scrolled");
    });

    const pills = document.querySelectorAll('.pill');
    const pillTimelines = [];

    function initPillNav() {
        if(typeof gsap === 'undefined') return; 

        pills.forEach((pill, i) => {
            const circle = pill.querySelector('.hover-circle');
            const label = pill.querySelector('.pill-label');
            const hoverLabel = pill.querySelector('.pill-label-hover');

            if (!circle || !label || !hoverLabel) return;

           
            const rect = pill.getBoundingClientRect();
            const w = rect.width;
            const h = rect.height;
            const R = ((w * w) / 4 + h * h) / (2 * h);
            const D = Math.ceil(2 * R) + 2;
            const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
            const originY = D - delta;

            circle.style.width = `${D}px`;
            circle.style.height = `${D}px`;
            circle.style.bottom = `-${delta}px`;

            gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${originY}px` });
            gsap.set(label, { y: 0 });
            gsap.set(hoverLabel, { y: Math.ceil(h + 100), opacity: 0 });

            if (pillTimelines[i]) pillTimelines[i].kill();

            const tl = gsap.timeline({ paused: true });
            tl.to(circle, { scale: 1.2, xPercent: -50, duration: 0.35, ease: "power3.inOut" }, 0)
              .to(label, { y: -(h + 8), duration: 0.35, ease: "power3.inOut" }, 0)
              .to(hoverLabel, { y: 0, opacity: 1, duration: 0.35, ease: "power3.inOut" }, 0);

            pillTimelines[i] = tl;

            if (!pill.dataset.listenerAttached) {
                pill.addEventListener('mouseenter', () => pillTimelines[i].play());
                pill.addEventListener('mouseleave', () => pillTimelines[i].reverse());
                pill.dataset.listenerAttached = "true";
            }
        });
    }

    setTimeout(initPillNav, 200);
    window.addEventListener('resize', () => requestAnimationFrame(initPillNav));

    const tiltWrapper = document.getElementById("tilt-wrapper");
    const parallaxLayers = document.querySelectorAll(".parallax-layer");
    const heroSection = document.getElementById("hero");

    if(heroSection && tiltWrapper) {
        heroSection.addEventListener("mousemove", (e) => {
            const x = window.innerWidth / 2 - e.pageX;
            const y = window.innerHeight / 2 - e.pageY;
            tiltWrapper.style.transform = `rotateX(${y / 40}deg) rotateY(${-(x / 40)}deg)`;
            parallaxLayers.forEach(layer => {
                const speed = layer.getAttribute("data-speed");
                layer.style.marginLeft = `${(x * speed) / 100}px`;
                layer.style.marginTop = `${(y * speed) / 100}px`;
            });
        });
        heroSection.addEventListener("mouseleave", () => {
            tiltWrapper.style.transform = `rotateX(0deg) rotateY(0deg)`;
            parallaxLayers.forEach(layer => {
                layer.style.marginLeft = `0px`;
                layer.style.marginTop = `0px`;
            });
        });
    }

    
    const cards = document.querySelectorAll('.stacked-card');
    let isTicking = false;

    function updateStickyTops() {
        if (window.innerWidth <= 768) return; 
        cards.forEach(card => {
            if (card.id === 'hero') { card.style.top = '0px'; return; }
            const diff = window.innerHeight - card.offsetHeight;
            card.style.top = diff < 0 ? `${diff}px` : '0px';
        });
    }
    
   
    const resizeObserver = new ResizeObserver(updateStickyTops);
    cards.forEach(card => resizeObserver.observe(card));
    window.addEventListener('load', updateStickyTops);

    function handleCardScroll() {
        if (window.innerWidth <= 768) return; 
        const wh = window.innerHeight;
        
        cards.forEach((card, index) => {
            const rect = card.getBoundingClientRect();
            const stickyTop = parseFloat(card.style.top) || 0;
            
            if (rect.top <= stickyTop) {
                const nextCard = cards[index + 1];
                if (nextCard) {
                    const nextRect = nextCard.getBoundingClientRect();
                    const overlap = wh - nextRect.top; 
                    
                    if (overlap > 0) {
                        let progress = overlap / wh;
                        if (progress > 1) progress = 1;
                        
                        const scale = 1 - (0.05 * progress); 
                        const brightness = 1 - (0.4 * progress); 
                        
                        card.style.transform = `scale(${scale})`;
                        card.style.filter = `brightness(${brightness})`;
                    } else {
                        card.style.transform = `scale(1)`;
                        card.style.filter = `brightness(1)`;
                    }
                }
            } else {
                card.style.transform = `scale(1)`;
                card.style.filter = `brightness(1)`;
            }
        });
        isTicking = false;
    }

    window.addEventListener('scroll', () => {
        if (!isTicking) {
            window.requestAnimationFrame(handleCardScroll);
            isTicking = true;
        }
    });

    
    const counters = document.querySelectorAll('.counter');
    let hasCounted = false;

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasCounted) {
                hasCounted = true; 
                counters.forEach(counter => {
                    const updateCount = () => {
                        const target = +counter.getAttribute('data-target');
                        const count = +counter.innerText;
                        const increment = target / 40; 
                        
                        if (count < target) {
                            counter.innerText = Math.ceil(count + increment);
                            setTimeout(updateCount, 40);
                        } else {
                            counter.innerText = target; 
                        }
                    };
                    updateCount();
                });
            }
        });
    }, { threshold: 0.5 }); 

    const statsContainer = document.getElementById('stats-container');
    if (statsContainer) counterObserver.observe(statsContainer);

    const sections = document.querySelectorAll("section, footer"); 
    const navDots = document.querySelectorAll(".pagination-sidebar .dot");

    const dotObserverOptions = { root: null, rootMargin: '-20% 0px -50% 0px', threshold: 0 };
    const dotObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute("id");
                navDots.forEach(dot => {
                    dot.classList.remove("active");
                    if (dot.getAttribute("href") === `#${currentId}`) dot.classList.add("active");
                });
            }
        });
    }, dotObserverOptions);
    sections.forEach(section => dotObserver.observe(section));

    const revealElements = document.querySelectorAll('.reveal');
    const revealOptions = { threshold: 0.1, rootMargin: "0px 0px 0px 0px" };
    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            observer.unobserve(entry.target); 
        });
    }, revealOptions);
    revealElements.forEach(el => revealOnScroll.observe(el));

    const mobileMenuBtn = document.getElementById("mobile-menu");
    const navLinks = document.querySelector(".nav-links");

    if(mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener("click", () => {
            if(navLinks.style.display === "flex") {
                navLinks.style.display = "none";
            } else {
                navLinks.style.display = "flex";
                navLinks.style.flexDirection = "column";
                navLinks.style.position = "absolute";
                navLinks.style.top = "80px";
                navLinks.style.left = "0";
                navLinks.style.width = "100%";
                navLinks.style.background = "rgba(11, 11, 11, 0.95)";
                navLinks.style.backdropFilter = "blur(10px)";
                navLinks.style.padding = "20px 0";
                navLinks.style.alignItems = "center";
                navLinks.style.boxShadow = "0 10px 30px rgba(0,0,0,0.8)";
            }
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener("click", () => {
                if(window.innerWidth <= 768) navLinks.style.display = "none";
            });
        });
    }
});