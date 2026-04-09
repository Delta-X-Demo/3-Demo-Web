document.addEventListener("DOMContentLoaded", () => {
    
    const yearSpan = document.getElementById("current-year");
    if(yearSpan) yearSpan.textContent = new Date().getFullYear();

    const navbar = document.getElementById("navbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) navbar.classList.add("scrolled");
        else navbar.classList.remove("scrolled");
    });

    /* --- GSAP PILL NAV --- */
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

    /* --- HERO PARALLAX --- */
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

    /* --- STACKING CARDS SCROLL ENGINE --- */
    const stackCards = document.querySelectorAll('.stacked-card');
    let isTicking = false;

    function updateStickyTops() {
        if (window.innerWidth <= 768) return; 
        stackCards.forEach(card => {
            if (card.id === 'hero') { card.style.top = '0px'; return; }
            const diff = window.innerHeight - card.offsetHeight;
            card.style.top = diff < 0 ? `${diff}px` : '0px';
        });
    }
    
    const resizeObserver = new ResizeObserver(updateStickyTops);
    stackCards.forEach(card => resizeObserver.observe(card));
    window.addEventListener('load', updateStickyTops);

    function handleCardScroll() {
        if (window.innerWidth <= 768) return; 
        const wh = window.innerHeight;
        
        stackCards.forEach((card, index) => {
            const rect = card.getBoundingClientRect();
            const stickyTop = parseFloat(card.style.top) || 0;
            
            if (rect.top <= stickyTop) {
                const nextCard = stackCards[index + 1];
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

    /* --- NUMBER COUNTER ANIMATION --- */
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

    /* --- SCROLL SPY FOR PAGINATION DOTS --- */
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

    /* --- INTERSECTION OBSERVER FOR FADE-UP ANIMATIONS --- */
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

    /* --- MOBILE MENU (SMOOTH EXPAND & CLOSE) --- */
    const mobileMenuBtn = document.getElementById("mobile-menu");
    const navLinks = document.querySelector(".nav-links");
    let isMenuOpen = false;

    if(mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener("click", () => {
            isMenuOpen = !isMenuOpen;
            
            mobileMenuBtn.classList.toggle("active");

            if(isMenuOpen) {
                navLinks.style.display = "flex";
                navLinks.style.flexDirection = "column";
                navLinks.style.position = "absolute";
                navLinks.style.top = "80px";
                navLinks.style.left = "0";
                navLinks.style.width = "100%";
                navLinks.style.background = "rgba(11, 11, 11, 0.98)";
                navLinks.style.backdropFilter = "blur(15px)";
                navLinks.style.padding = "30px 0";
                navLinks.style.alignItems = "center";
                navLinks.style.boxShadow = "0 20px 40px rgba(0,0,0,0.9)";
                
                gsap.fromTo(navLinks, 
                    { opacity: 0, y: -20 }, 
                    { opacity: 1, y: 0, duration: 0.4, ease: "power3.out", overwrite: "auto" }
                );
            } else {
                
                gsap.to(navLinks, {
                    opacity: 0,
                    y: -20,
                    duration: 0.3,
                    ease: "power3.in",
                    overwrite: "auto",
                    onComplete: () => {
                        navLinks.style.display = "none";
                    }
                });
            }
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener("click", () => {
                if(window.innerWidth <= 768 && isMenuOpen) {
                    isMenuOpen = false;
                    mobileMenuBtn.classList.remove("active"); // Turn 'X' back to 3 lines
                    
                    gsap.to(navLinks, {
                        opacity: 0,
                        y: -20,
                        duration: 0.3,
                        ease: "power3.in",
                        overwrite: "auto",
                        onComplete: () => {
                            navLinks.style.display = "none";
                        }
                    });
                }
            });
        });
    }

    const interactiveCards = document.querySelectorAll('.card, .blog-card');
    
    interactiveCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
          
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    /* --- WEBGL LIGHT RAYS --- */
    function initLightRays() {
        if (typeof ogl === 'undefined') return;

        const container = document.getElementById('light-rays');
        if (!container) return;

        const raysOrigin = 'top-center'; 
        const raysColor = '#D4AF37'; 
        const raysSpeed = 0.8;
        const lightSpread = 1.2;
        const rayLength = 2.0;
        const pulsating = true;
        const fadeDistance = 1.0;
        const saturation = 1.0;
        const followMouse = true;
        const mouseInfluence = 0.15;
        const noiseAmount = 0.03;
        const distortion = 0.05;

        const { Renderer, Program, Triangle, Mesh } = ogl;
        const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), alpha: true });
        const gl = renderer.gl;
        
        gl.canvas.style.width = '100%';
        gl.canvas.style.height = '100%';
        container.appendChild(gl.canvas);

        const hexToRgb = hex => {
            const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [1, 1, 1];
        };

        const getAnchorAndDir = (origin, w, h) => {
            const outside = 0.2;
            switch (origin) {
                case 'top-left': return { anchor: [0, -outside * h], dir: [0, 1] };
                case 'top-right': return { anchor: [w, -outside * h], dir: [0, 1] };
                case 'left': return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] };
                case 'right': return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
                case 'bottom-left': return { anchor: [0, (1 + outside) * h], dir: [0, -1] };
                case 'bottom-center': return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
                case 'bottom-right': return { anchor: [w, (1 + outside) * h], dir: [0, -1] };
                default: return { anchor: [0.5 * w, -outside * h], dir: [0, 1] }; 
            }
        };

        const vert = `
            attribute vec2 position;
            varying vec2 vUv;
            void main() {
                vUv = position * 0.5 + 0.5;
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;

        const frag = `
            precision highp float;
            uniform float iTime;
            uniform vec2  iResolution;
            uniform vec2  rayPos;
            uniform vec2  rayDir;
            uniform vec3  raysColor;
            uniform float raysSpeed;
            uniform float lightSpread;
            uniform float rayLength;
            uniform float pulsating;
            uniform float fadeDistance;
            uniform float saturation;
            uniform vec2  mousePos;
            uniform float mouseInfluence;
            uniform float noiseAmount;
            uniform float distortion;

            varying vec2 vUv;

            float noise(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }

            float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed) {
                vec2 sourceToCoord = coord - raySource;
                vec2 dirNorm = normalize(sourceToCoord);
                float cosAngle = dot(dirNorm, rayRefDirection);
                float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
                float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));
                float distance = length(sourceToCoord);
                float maxDistance = iResolution.x * rayLength;
                float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
                float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
                float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

                float baseStrength = clamp(
                    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
                    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
                    0.0, 1.0
                );

                return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
            }

            void mainImage(out vec4 fragColor, in vec2 fragCoord) {
                vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
                vec2 finalRayDir = rayDir;
                
                if (mouseInfluence > 0.0) {
                    vec2 mouseScreenPos = mousePos * iResolution.xy;
                    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
                    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
                }

                vec4 rays1 = vec4(1.0) * rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349, 1.5 * raysSpeed);
                vec4 rays2 = vec4(1.0) * rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234, 1.1 * raysSpeed);

                fragColor = rays1 * 0.5 + rays2 * 0.4;

                if (noiseAmount > 0.0) {
                    float n = noise(coord * 0.01 + iTime * 0.1);
                    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
                }

                float brightness = 1.0 - (coord.y / iResolution.y);
                fragColor.x *= 0.1 + brightness * 0.8;
                fragColor.y *= 0.3 + brightness * 0.6;
                fragColor.z *= 0.5 + brightness * 0.5;

                if (saturation != 1.0) {
                    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
                    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
                }

                fragColor.rgb *= raysColor;
            }

            void main() {
                vec4 color;
                mainImage(color, gl_FragCoord.xy);
                gl_FragColor  = color;
            }
        `;

        const uniforms = {
            iTime: { value: 0 },
            iResolution: { value: [1, 1] },
            rayPos: { value: [0, 0] },
            rayDir: { value: [0, 1] },
            raysColor: { value: hexToRgb(raysColor) },
            raysSpeed: { value: raysSpeed },
            lightSpread: { value: lightSpread },
            rayLength: { value: rayLength },
            pulsating: { value: pulsating ? 1.0 : 0.0 },
            fadeDistance: { value: fadeDistance },
            saturation: { value: saturation },
            mousePos: { value: [0.5, 0.5] },
            mouseInfluence: { value: mouseInfluence },
            noiseAmount: { value: noiseAmount },
            distortion: { value: distortion }
        };

        const geometry = new Triangle(gl);
        const program = new Program(gl, { vertex: vert, fragment: frag, uniforms });
        const mesh = new Mesh(gl, { geometry, program });

        const updatePlacement = () => {
            renderer.dpr = Math.min(window.devicePixelRatio, 2);
            const wCSS = container.clientWidth;
            const hCSS = container.clientHeight;
            renderer.setSize(wCSS, hCSS);

            const dpr = renderer.dpr;
            const w = wCSS * dpr;
            const h = hCSS * dpr;

            uniforms.iResolution.value = [w, h];
            const { anchor, dir } = getAnchorAndDir(raysOrigin, w, h);
            uniforms.rayPos.value = anchor;
            uniforms.rayDir.value = dir;
        };

        window.addEventListener('resize', updatePlacement);
        updatePlacement();

        let targetMouse = { x: 0.5, y: 0.5 };
        let smoothMouse = { x: 0.5, y: 0.5 };

        if (followMouse) {
            window.addEventListener('mousemove', (e) => {
                const rect = container.getBoundingClientRect();
                targetMouse.x = (e.clientX - rect.left) / rect.width;
                targetMouse.y = (e.clientY - rect.top) / rect.height;
            });
        }

        let isVisible = true;
        const heroObserver = new IntersectionObserver((entries) => {
            isVisible = entries[0].isIntersecting;
        }, { threshold: 0 });
        heroObserver.observe(document.getElementById('hero'));

        const loop = (t) => {
            requestAnimationFrame(loop);
            
            if (!isVisible) return; 

            uniforms.iTime.value = t * 0.001;

            if (followMouse && mouseInfluence > 0.0) {
                const smoothing = 0.92;
                smoothMouse.x = smoothMouse.x * smoothing + targetMouse.x * (1 - smoothing);
                smoothMouse.y = smoothMouse.y * smoothing + targetMouse.y * (1 - smoothing);
                uniforms.mousePos.value = [smoothMouse.x, smoothMouse.y];
            }

            renderer.render({ scene: mesh });
        };

        requestAnimationFrame(loop);
    }

    initLightRays();
});