// --- LOADER : DISPARAIT QUAND LA PAGE EST CHARGEE ---
window.addEventListener('load', () => {
    const loader = document.getElementById('loader-wrapper');
    
    setTimeout(() => {
        if (loader) {
            loader.classList.add('loader-hidden');
            loader.addEventListener('transitionend', () => {
                if(document.body.contains(loader)) {
                    document.body.removeChild(loader);
                }
            });
        }
    }, 800);
});

// Variables globales
let scene, camera, renderer, particles, avatar;
let currentExperience = 1;
let isMenuOpen = false;
let currentSlide = 0;
let currentProjectImages = [];

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    initThreeJS();
    initScrollAnimations();
    initNavigation();
    initCarousel();
    initCounters();
    initContactForm();
    initFloatingParticles();
    initModalSystem();
    initCookieBanner(); // Initialisation de la bannière cookies
    
    // Start animations
    animate();
});

// Three.js
function initThreeJS() {
    const heroBackground = document.getElementById('hero-background');
    const heroAvatar = document.getElementById('hero-avatar');
    
    if (!heroBackground) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    heroBackground.appendChild(renderer.domElement);
    
    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    const material = new THREE.MeshBasicMaterial({
        color: 0x00d4ff,
        wireframe: true,
        transparent: true,
        opacity: 0.1
    });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);
    
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 100;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x00d4ff,
        size: 0.5,
        transparent: true,
        opacity: 0.6
    });
    
    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    
    const avatarGeometry = new THREE.IcosahedronGeometry(2, 1);
    const avatarMaterial = new THREE.MeshBasicMaterial({
        color: 0xff00ff,
        wireframe: true,
        transparent: true,
        opacity: 0.8
    });
    avatar = new THREE.Mesh(avatarGeometry, avatarMaterial);
    avatar.position.set(0, 0, -10);
    scene.add(avatar);
    
    camera.position.z = 30;
    
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    if (scene && scene.children[0]) {
        scene.children[0].rotation.x += 0.005;
        scene.children[0].rotation.y += 0.01;
    }
    
    if (particles) {
        particles.rotation.y += 0.002;
        const positions = particles.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
            positions[i] += Math.sin(Date.now() * 0.001 + i) * 0.01;
        }
        particles.geometry.attributes.position.needsUpdate = true;
    }
    
    if (avatar) {
        avatar.rotation.x += 0.01;
        avatar.rotation.y += 0.02;
        avatar.position.y = Math.sin(Date.now() * 0.001) * 0.5;
    }
    
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Animations de défilement
function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);
    
    const navbar = document.getElementById('navbar');
    
    if (navbar) {
        ScrollTrigger.create({
            trigger: "body",
            start: "top -80",
            end: "bottom bottom",
            onUpdate: (self) => {
                if (self.direction === 1) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
        });
    }
    
    gsap.utils.toArray('section').forEach((section, i) => {
        gsap.fromTo(section, 
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: section,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });
    
    gsap.utils.toArray('.timeline-item').forEach((item, i) => {
        gsap.fromTo(item,
            { opacity: 0, x: i % 2 === 0 ? -100 : 100 },
            {
                opacity: 1,
                x: 0,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: item,
                    start: "top 80%",
                    onEnter: () => item.classList.add('animate')
                }
            }
        );
    });
    
    const cards = gsap.utils.toArray('.cert-card, .cert-card-horizontal, .project-card, .skill-card-detailed, .article-card, .faq-card');
    cards.forEach((card, i) => {
        gsap.fromTo(card,
            { opacity: 0, y: 50, scale: 0.95 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                delay: (i % 3) * 0.1, 
                ease: "power2.out",
                scrollTrigger: {
                    trigger: card,
                    start: "top 90%"
                }
            }
        );
    });
}

// Navigation
function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            isMenuOpen = !isMenuOpen;
            
            const bars = hamburger.querySelectorAll('.bar');
            if (isMenuOpen) {
                gsap.to(bars[0], { rotation: 45, y: 7, duration: 0.3 });
                gsap.to(bars[1], { opacity: 0, duration: 0.3 });
                gsap.to(bars[2], { rotation: -45, y: -7, duration: 0.3 });
            } else {
                gsap.to(bars[0], { rotation: 0, y: 0, duration: 0.3 });
                gsap.to(bars[1], { opacity: 1, duration: 0.3 });
                gsap.to(bars[2], { rotation: 0, y: 0, duration: 0.3 });
            }
        });
    }
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                gsap.to(window, {
                    duration: 1,
                    scrollTo: { y: targetSection, offsetY: 70 },
                    ease: "power2.inOut"
                });
            }
            
            if (isMenuOpen && hamburger) {
                hamburger.click();
            }
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

// Carrousel Expérience
function initCarousel() {
    showExperience(currentExperience);
}

function changeExperience(direction) {
    const cards = document.querySelectorAll('.experience-card');
    const indicators = document.querySelectorAll('.indicator');
    
    if (cards.length === 0) return;

    cards[currentExperience - 1].classList.remove('active');
    if(indicators[currentExperience - 1]) indicators[currentExperience - 1].classList.remove('active');
    
    currentExperience += direction;
    if (currentExperience > cards.length) currentExperience = 1;
    if (currentExperience < 1) currentExperience = cards.length;
    
    gsap.fromTo(cards[currentExperience - 1], 
        { opacity: 0, x: direction > 0 ? 50 : -50 },
        { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
    );
    
    cards[currentExperience - 1].classList.add('active');
    if(indicators[currentExperience - 1]) indicators[currentExperience - 1].classList.add('active');
}

function showCurrentExperience(n) {
    const cards = document.querySelectorAll('.experience-card');
    const indicators = document.querySelectorAll('.indicator');
    
    if (n === currentExperience || cards.length === 0) return;
    
    cards[currentExperience - 1].classList.remove('active');
    if(indicators[currentExperience - 1]) indicators[currentExperience - 1].classList.remove('active');
    
    currentExperience = n;
    
    gsap.fromTo(cards[currentExperience - 1], 
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
    );
    
    cards[currentExperience - 1].classList.add('active');
    if(indicators[currentExperience - 1]) indicators[currentExperience - 1].classList.add('active');
}

function showExperience(n) {
    const cards = document.querySelectorAll('.experience-card');
    const indicators = document.querySelectorAll('.indicator');
    
    if (cards.length === 0) return;

    cards.forEach(card => card.classList.remove('active'));
    indicators.forEach(ind => ind.classList.remove('active'));
    
    if (cards[n - 1]) {
        cards[n - 1].classList.add('active');
        if(indicators[n - 1]) indicators[n - 1].classList.add('active');
    }
}

// Compteurs
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        
        ScrollTrigger.create({
            trigger: counter,
            start: "top 80%",
            onEnter: () => {
                gsap.to(counter, {
                    innerHTML: target,
                    duration: 2,
                    ease: "power2.out",
                    snap: { innerHTML: 1 },
                    onUpdate: function() {
                        counter.innerHTML = Math.ceil(counter.innerHTML);
                    }
                });
            }
        });
    });
}

// Contact
function initContactForm() {
    const form = document.getElementById('contact-form');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';
            submitBtn.disabled = true;

            const formData = new FormData(form);
            
            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Message envoyé !';
                    submitBtn.style.background = 'linear-gradient(135deg, #00d4ff, #00aaff)';
                    form.reset();
                } else {
                    submitBtn.innerHTML = '<i class="fas fa-times"></i> Erreur';
                    submitBtn.style.background = '#ff0055';
                    alert("Oups ! Il y a eu un problème lors de l'envoi.");
                }
            } catch (error) {
                submitBtn.innerHTML = '<i class="fas fa-times"></i> Erreur réseau';
                submitBtn.style.background = '#ff0055';
                alert("Erreur de connexion. Vérifiez votre internet.");
            }

            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.style.background = '';
            }, 3000);
        });

        const inputs = document.querySelectorAll('.form-group input, .form-group textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                const label = input.nextElementSibling;
                if (label) {
                    gsap.to(label, { y: -25, scale: 0.8, color: '#00d4ff', duration: 0.3 });
                }
            });
            input.addEventListener('blur', () => {
                if (!input.value) {
                    const label = input.nextElementSibling;
                    if (label) {
                        gsap.to(label, { y: 0, scale: 1, color: '#b0b0b0', duration: 0.3 });
                    }
                }
            });
        });
    }
}

// Particules
function initFloatingParticles() {
    const particlesContainer = document.querySelector('.floating-particles');
    
    if (particlesContainer) {
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 1}px;
                height: ${Math.random() * 4 + 1}px;
                background: #00d4ff;
                border-radius: 50%;
                opacity: ${Math.random() * 0.5 + 0.2};
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                pointer-events: none;
            `;
            
            particlesContainer.appendChild(particle);
            
            gsap.to(particle, {
                y: -100,
                x: Math.random() * 200 - 100,
                opacity: 0,
                duration: Math.random() * 3 + 2,
                repeat: -1,
                ease: "none",
                delay: Math.random() * 2
            });
        }
    }
}

// *** LOGIQUE DU CARROUSEL MODAL ***
window.changeModalSlide = function(n) {
    if (currentProjectImages.length === 0) return;
    
    const slides = document.querySelectorAll('.modal-img');
    if(slides.length > 0) {
        slides[currentSlide].classList.remove('active');
        
        currentSlide += n;
        
        if (currentSlide >= currentProjectImages.length) {
            currentSlide = 0;
        } else if (currentSlide < 0) {
            currentSlide = currentProjectImages.length - 1;
        }
        
        slides[currentSlide].classList.add('active');
    }
}

// Système de modales avec Mentions Légales
function initModalSystem() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    const modalData = {
        // --- CONTENU DES MENTIONS LEGALES ---
        legal: {
            title: 'Mentions Légales',
            content: `
                <h3>Mentions Légales & Conditions Générales</h3>
                <p><strong>1. Éditeur du site</strong></p>
                <p>Le présent site est édité par Muslim Bayschanov, étudiant en BTS SIO option SISR.</p>
                
                <p><strong>2. Hébergement</strong></p>
                <p>Ce site est hébergé sur GitHub Pages.</p>
                
                <p><strong>3. Propriété intellectuelle</strong></p>
                <p>L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.</p>
                
                <p><strong>4. Données personnelles</strong></p>
                <p>Aucune donnée personnelle n'est collectée à votre insu. Les informations saisies dans le formulaire de contact ne sont utilisées que pour répondre à votre demande via le service Formspree.</p>
            `
        },
        cert1: {
            title: 'Introduction to Packet Tracer',
            content: `
                <h3>Introduction to Packet Tracer</h3>
                <p><strong>Délivré par :</strong> Cisco Networking Academy</p>
                <p><strong>Date :</strong> 26 Septembre 2025</p>
                <p>Ce certificat confirme la capacité à utiliser Cisco Packet Tracer pour simuler, visualiser et configurer des réseaux.</p>
                <ul>
                    <li>Création de topologies réseaux simples et complexes</li>
                    <li>Configuration de périphériques IoT</li>
                    <li>Dépannage et simulation de flux de données</li>
                </ul>
            `
        },
        cert2: {
            title: 'Notions de base sur les réseaux',
            content: `
                <h3>Notions de base sur les réseaux</h3>
                <p><strong>Délivré par :</strong> Cisco Networking Academy</p>
                <p><strong>Date :</strong> 19 Novembre 2025</p>
                <p>Certification validant les connaissances fondamentales sur le fonctionnement des réseaux informatiques.</p>
                <ul>
                    <li>Compréhension des protocoles IPv4/IPv6</li>
                    <li>Architecture des réseaux locaux (LAN)</li>
                    <li>Services réseaux de base et sécurité élémentaire</li>
                </ul>
            `
        },
        cert3: {
            title: 'Introduction à la cybersécurité',
            content: `
                <h3>Introduction à la cybersécurité</h3>
                <p><strong>Délivré par :</strong> Cisco Networking Academy</p>
                <p><strong>Date :</strong> 19 Novembre 2025</p>
                <p>Attestation de compétences sur les principes de protection de la vie numérique et des systèmes d'entreprise.</p>
                <ul>
                    <li>Identification des menaces et vulnérabilités</li>
                    <li>Protection des données et confidentialité</li>
                    <li>Principes de base de la sécurité organisationnelle</li>
                </ul>
            `
        },
        project1: {
            title: 'Site Chicken Point',
            images: [
                'chickenpoint1.png',
                'chickenpoint2.png',
                'chickenpoint3.png',
                'chickenpoint4.png',
                'chickenpoint5.png',
                'chickenpoint6.png',
                'chickenpoint7.png',
                'chickenpoint8.png',
                'chickenpoint9.png',
                'chickenpoint10.png' 
            ],
            content: `
                <h3>Site Web - Chicken Point</h3>
                <p><strong>Type :</strong> Développement Web Front-End</p>
                <p>Création d'une interface vitrine moderne et responsive pour un restaurant local.</p>
                <h4>Fonctionnalités :</h4>
                <ul>
                    <li>Design responsive (adapté mobile/tablette)</li>
                    <li>Présentation des menus et produits</li>
                    <li>Intégration de liens vers les réseaux sociaux</li>
                    <li>Optimisation des images et du chargement</li>
                </ul>
                <p><strong>Technologies :</strong> HTML5, CSS3, Animations CSS</p>
            `
        },
        project2: {
            title: 'Infrastructure SLM',
            images: [
                'eportfolio1.png',
                'eportfolio2.png',
                'eportfolio3.png',
                'eportfolio4.png',
                'eportfolio5.png',
                'eportfolio6.png',
                'eportfolio7.png',
                'eportfolio8.png',
                'eportfolio9.png',
                'eportfolio10.png',
                'eportfolio11.png'
            ],
            content: `
                <h3>Infrastructure de Données (SLM)</h3>
                <p><strong>Type :</strong> Architecture & Data</p>
                <p>Conception théorique d'un cycle de vie de gestion de service (SLM) et de traitement de données.</p>
                <h4>Étapes du schéma :</h4>
                <ul>
                    <li>Collecte et stockage sécurisé des données</li>
                    <li>Modélisation d'architecture système</li>
                    <li>Entraînement de modèles et paramétrage</li>
                    <li>Utilisation finale par les services connectés</li>
                </ul>
            `
        },
        project3: {
            title: 'Infrastructure Windows Server',
            images: [
                'shoptonauto1.png',
                'shoptonauto2.png'
            ],
            content: `
                <h3>Administration Système Windows</h3>
                <p><strong>Contexte :</strong> Laboratoire BTS SIO SISR</p>
                <p>Mise en place complète d'une infrastructure réseau d'entreprise simulée.</p>
                <h4>Réalisations :</h4>
                <ul>
                    <li>Installation de Windows Server 2022 sur machine virtuelle</li>
                    <li>Configuration du rôle Active Directory (AD DS)</li>
                    <li>Création d'utilisateurs, groupes et Unités d'Organisation (OU)</li>
                    <li>Gestion des droits d'accès et stratégies de groupe (GPO)</li>
                </ul>
            `
        }
    };
    
    window.openModal = function(modalId) {
        const data = modalData[modalId];
        if (data && modalBody) {
            
            let sliderHTML = '';
            if (data.images && data.images.length > 0) {
                currentProjectImages = data.images;
                currentSlide = 0;
                
                let imagesHTML = '';
                data.images.forEach((imgSrc, index) => {
                    const activeClass = (index === 0) ? 'active' : '';
                    imagesHTML += `<img src="${imgSrc}" class="modal-img ${activeClass}" alt="Image projet" onerror="this.style.display='none'">`;
                });
                
                sliderHTML = `
                    <div class="modal-carousel">
                        <button class="nav-btn prev-btn" onclick="changeModalSlide(-1)">&#10094;</button>
                        ${imagesHTML}
                        <button class="nav-btn next-btn" onclick="changeModalSlide(1)">&#10095;</button>
                    </div>
                `;
            } else {
                currentProjectImages = [];
            }

            modalBody.innerHTML = sliderHTML + data.content;
            modal.style.display = 'block';
            
            gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.3 });
            const content = modal.querySelector('.modal-content');
            if(content) {
                gsap.fromTo(content,
                    { scale: 0.7, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
                );
            }
        }
    };
    
    window.closeModal = function() {
        if(modal) {
            gsap.to(modal, {
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    modal.style.display = 'none';
                }
            });
        }
    };
    
    if(modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.style.display === 'block') {
            closeModal();
        }
    });
}

// Fonction pour la bannière cookie
function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    const btn = document.getElementById('accept-cookies');
    
    // Vérifie si l'utilisateur a déjà accepté
    if (!localStorage.getItem('cookiesAccepted')) {
        setTimeout(() => {
            banner.classList.remove('hidden');
        }, 2000); // Apparaît après 2 secondes
    }
    
    if (btn) {
        btn.addEventListener('click', () => {
            localStorage.setItem('cookiesAccepted', 'true');
            banner.classList.add('hidden');
        });
    }
}

// Fonction globale pour scroller
window.scrollToSection = function(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        gsap.to(window, {
            duration: 1,
            scrollTo: { y: section, offsetY: 70 },
            ease: "power2.inOut"
        });
    }
}

// Ajout d'effets de lueur
ScrollTrigger.batch('.cert-card, .cert-card-horizontal, .project-card, .skill-card-detailed, .education-card', {
    onEnter: (elements) => {
        gsap.to(elements, {
            boxShadow: '0 0 30px rgba(0, 212, 255, 0.3)',
            duration: 0.5,
            stagger: 0.1
        });
    },
    onLeave: (elements) => {
        gsap.to(elements, {
            boxShadow: '0 0 0px rgba(0, 212, 255, 0)',
            duration: 0.5,
            stagger: 0.1
        });
    }
});

// Effet parallax
gsap.to('.hero-content', {
    yPercent: -50,
    ease: "none",
    scrollTrigger: {
        trigger: '.hero-section',
        start: "top bottom",
        end: "bottom top",
        scrub: true
    }
});

// Effet de saisie
function initTypingEffect() {
    const titleLines = document.querySelectorAll('.title-line');
    titleLines.forEach((line, index) => {
        const text = line.textContent;
        line.textContent = '';
        gsap.to(line, {
            duration: text.length * 0.05,
            delay: index * 0.5,
            ease: "none",
            onUpdate: function() {
                const progress = this.progress();
                const currentLength = Math.round(progress * text.length);
                line.textContent = text.substring(0, currentLength);
            }
        });
    });
}
setTimeout(initTypingEffect, 1000);

// Effet de suivi de la souris
document.addEventListener('mousemove', (e) => {
    let cursor = document.querySelector('.cursor');
    if (!cursor) {
        cursor = document.createElement('div');
        cursor.className = 'cursor';
        cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, #00d4ff, transparent);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            mix-blend-mode: difference;
            transition: transform 0.1s ease;
        `;
        document.body.appendChild(cursor);
    }
    gsap.to(cursor, {
        x: e.clientX - 10,
        y: e.clientY - 10,
        duration: 0.1
    });
});

// Observateur
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

document.querySelectorAll('.cert-card, .cert-card-horizontal, .project-card, .skill-card-detailed, .education-card, .timeline-item').forEach(el => {
    observer.observe(el);
});

console.log('Portfolio initialisé avec succès ! 🚀');