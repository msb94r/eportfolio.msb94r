// --- 1. LOADER : DISPARAIT QUAND LA PAGE EST CHARGEE ---
window.addEventListener('load', () => {
    const loader = document.getElementById('loader-wrapper');
    
    // Petit délai pour l'effet "Initialisation"
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

// --- 2. VARIABLES GLOBALES ---
let scene, camera, renderer, particles, avatar;
let currentExperience = 1;
let isMenuOpen = false;
let currentSlide = 0;
let currentProjectImages = [];

// Données du jeu Memory (Mises à jour)
const cardsData = [
    { 
        name: 'teamwork', 
        icon: 'fa-users', 
        label: 'Travail d\'équipe',
        description: "Au cours de mes semaines de travail et lors des projets scolaires, j'ai régulièrement dû collaborer en équipe. À travers ces expériences, j'ai développé l'habitude de travailler en groupe, ce qui implique de savoir partager les tâches, écouter activement les autres, apporter mon aide, prendre des initiatives et motiver l'équipe."
    },
    { 
        name: 'professionalization', 
        icon: 'fa-briefcase', 
        label: 'Professionalisation',
        description: "L'environnement professionnel de l'alternance m'a permis de découvrir le monde professionnel et de m'y adapter."
    },
    { 
        name: 'rigor', 
        icon: 'fa-clipboard-check', 
        label: 'Rigueur',
        description: "L'environnement professionnel de l'alternance au Ministère des Armées m'a appris à être rigoureux dans mon travail."
    },
    { 
        name: 'autonomy', 
        icon: 'fa-user-astronaut', 
        label: 'Autonomie',
        description: "L'environnement professionnel de l'alternance m'a permis de devenir encore plus autonome que je l'étais avant. Maintenant, au lieu de tout demander et de ne rien prévoir, je me renseigne et j'anticipe."
    },
    { 
        name: 'adaptability', 
        icon: 'fa-sync-alt', 
        label: 'S\'adapter',
        description: "Pendant mes 2 années de BTS, j'ai dû m'adapter aux horaires des usagers, mais aussi à leurs disponibilités."
    },
    { 
        name: 'confidence', 
        icon: 'fa-medal', 
        label: 'Confiance en soi',
        description: "À force d'appeler des utilisateurs pour résoudre leurs problèmes, j'ai dû montrer que j'étais confiant dans mes solutions."
    }
];

let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let matchCount = 0;


// --- 3. INITIALISATION ---
document.addEventListener('DOMContentLoaded', function() {
    initThreeJS();
    initScrollAnimations();
    initNavigation();
    initCarousel();
    initCounters();
    initContactForm();
    initFloatingParticles();
    initModalSystem();
    initGame(); // Lancement du jeu
    
    // Démarrage de la boucle d'animation
    animate();
});

// --- 4. THREE.JS (FOND 3D) ---
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

// --- 5. ANIMATIONS GSAP & SCROLL ---
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
    
    gsap.utils.toArray('section').forEach((section) => {
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
    
    gsap.utils.toArray('.timeline-item').forEach((item) => {
        gsap.fromTo(item,
            { opacity: 0, x: 0 },
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
    
    const cards = gsap.utils.toArray('.cert-card-horizontal, .project-card, .skill-card-detailed, .article-card, .faq-card');
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

// --- 6. NAVIGATION (MENU) ---
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

// --- 7. CARROUSEL EXPERIENCES ---
function initCarousel() {
    showExperience(currentExperience);
}

window.changeExperience = function(direction) {
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

window.showCurrentExperience = function(n) {
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

// --- 8. COMPTEURS ANIMÉS ---
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

// --- 9. CONTACT (FORMSPREE) ---
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

        // Animation input focus
        const inputs = document.querySelectorAll('.form-group input, .form-group textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                const label = input.nextElementSibling;
                if (label) gsap.to(label, { y: -25, scale: 0.8, color: '#00d4ff', duration: 0.3 });
            });
            input.addEventListener('blur', () => {
                if (!input.value) {
                    const label = input.nextElementSibling;
                    if (label) gsap.to(label, { y: 0, scale: 1, color: '#b0b0b0', duration: 0.3 });
                }
            });
        });
    }
}

// --- 10. EFFETS VISUELS ---
function initFloatingParticles() {
    const particlesContainer = document.querySelector('.floating-particles');
    if (!particlesContainer) return;

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

// --- 11. SYSTEME DE MODALES & SLIDER PROJET ---

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

function initModalSystem() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    const modalData = {
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

// --- 13. JEU MEMORY (MODIFIÉ AVEC POPUP) ---

function initGame() {
    const gameBoard = document.querySelector('.memory-game');
    if (!gameBoard) return;

    const cardsArray = [...cardsData, ...cardsData];
    cardsArray.sort(() => 0.5 - Math.random());

    let html = '';
    cardsArray.forEach(item => {
        html += `
            <div class="memory-card" data-name="${item.name}">
                <div class="front-face">
                    <i class="fas ${item.icon}"></i>
                    <span>${item.label}</span>
                </div>
                <div class="back-face">
                    <i class="fas fa-question"></i>
                </div>
            </div>
        `;
    });

    gameBoard.innerHTML = html;

    const cards = document.querySelectorAll('.memory-card');
    cards.forEach(card => card.addEventListener('click', flipCard));
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flip');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.name === secondCard.dataset.name;

    if (isMatch) {
        // Récupérer les infos de la compétence trouvée
        const skillName = firstCard.dataset.name;
        const skillData = cardsData.find(card => card.name === skillName);
        
        disableCards();
        
        // Afficher le popup après un court délai
        setTimeout(() => {
            showSkillModal(skillData);
        }, 500);
    } else {
        unflipCards();
    }
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);

    firstCard.querySelector('.front-face').style.borderColor = '#00d4ff';
    secondCard.querySelector('.front-face').style.borderColor = '#00d4ff';

    resetBoard();
    matchCount++;

    if (matchCount === cardsData.length) {
        setTimeout(() => {
            const winMessage = document.getElementById('win-message');
            if(winMessage) winMessage.classList.remove('hidden');
        }, 1000); // Attendre un peu plus que le dernier popup s'affiche
    }
}

function unflipCards() {
    lockBoard = true;
    
    firstCard.querySelector('.front-face').style.borderColor = '#ff00ff';
    secondCard.querySelector('.front-face').style.borderColor = '#ff00ff';

    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        firstCard.querySelector('.front-face').style.borderColor = '';
        secondCard.querySelector('.front-face').style.borderColor = '';
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

// Nouvelle fonction pour afficher le popup de compétence
function showSkillModal(data) {
    const modal = document.getElementById('skill-modal');
    const title = document.getElementById('skill-title-target');
    const desc = document.getElementById('skill-desc-target');
    const icon = document.getElementById('skill-icon-target');

    if (modal && data) {
        title.innerText = data.label;
        desc.innerText = data.description;
        icon.className = `fas ${data.icon}`;
        
        modal.classList.remove('hidden');
    }
}

// Fonction pour fermer le popup (appelée par le bouton HTML)
window.closeSkillModal = function() {
    const modal = document.getElementById('skill-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

window.resetGame = function() {
    const winMessage = document.getElementById('win-message');
    if(winMessage) winMessage.classList.add('hidden');
    matchCount = 0;
    
    const cards = document.querySelectorAll('.memory-card');
    cards.forEach(card => {
        card.classList.remove('flip');
        card.querySelector('.front-face').style.borderColor = '';
    });

    setTimeout(() => {
        initGame();
    }, 600);
}