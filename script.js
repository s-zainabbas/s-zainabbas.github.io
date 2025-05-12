// Initialize particles.js
document.addEventListener('DOMContentLoaded', function () {
    particlesJS('particles-js', {
        "particles": {
            "number": {
                "value": 100,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#000000"
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                },
                "polygon": {
                    "nb_sides": 6
                }
            },
            "opacity": {
                "value": 0.5,
                "random": false,
                "anim": {
                    "enable": false,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 3,
                "random": true,
                "anim": {
                    "enable": false,
                    "speed": 40,
                    "size_min": 0.1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#000000",
                "opacity": 0.4,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 2,
                "direction": "none",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": false,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "grab"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 140,
                    "line_linked": {
                        "opacity": 1
                    }
                },
                "bubble": {
                    "distance": 400,
                    "size": 40,
                    "duration": 2,
                    "opacity": 8,
                    "speed": 3
                },
                "repulse": {
                    "distance": 200,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": true
    });

    // Initialize 3D scene
    init3DScene();

    // Initialize enhanced sections
    initEnhancedSections();
});

// Enhanced Sections Initialization
function initEnhancedSections() {
    // Add hover effects to company logos
    const companyLogos = document.querySelectorAll('.company-logo-container');
    companyLogos.forEach(logo => {
        logo.addEventListener('mouseenter', () => {
            logo.querySelector('.company-logo').style.transform = 'scale(1.15)';
        });
        logo.addEventListener('mouseleave', () => {
            logo.querySelector('.company-logo').style.transform = 'scale(1)';
        });
    });

    // Add click effect to timeline items
    const timelineItems = document.querySelectorAll('.timeline-content');
    timelineItems.forEach(item => {
        item.addEventListener('click', function() {
            // Toggle expanded view
            this.classList.toggle('expanded');
            
            // If expanded, scroll to center the item
            if (this.classList.contains('expanded')) {
                this.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });

    // Add animation to education cards
    const educationCards = document.querySelectorAll('.education-card');
    educationCards.forEach((card, index) => {
        // Add delay based on index for staggered animation
        card.style.transitionDelay = `${index * 0.1}s`;
        
        // Add hover effect
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
            card.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.15)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        });
    });

    // Animate education section on scroll
    const educationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    educationCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.5s ease-out';
        educationObserver.observe(card);
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });

        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active-nav');
        });
        this.classList.add('active-nav');
    });
});

// Animate skill bars on scroll
const skillBars = document.querySelectorAll('.skill-progress');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const width = entry.target.style.width;
            entry.target.style.width = '0';
            setTimeout(() => {
                entry.target.style.width = width;
            }, 100);
        }
    });
}, { threshold: 0.5 });

skillBars.forEach(bar => {
    observer.observe(bar);
});

// Initialize 3D Scene with enhanced interactivity
function init3DScene() {
    const container = document.getElementById('3d-container');
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null;
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Sphere geometry
    const geometry = new THREE.IcosahedronGeometry(2.5 , 3);
    const material = new THREE.MeshPhongMaterial({
        color: 0x000000,
        wireframe: true,
        transparent: true,
        opacity: 0.5
    });
    const techSphere = new THREE.Mesh(geometry, material);
    scene.add(techSphere);

    // Binary digits as particles
    const binaryGroup = new THREE.Group();
    const binaryDigits = ['0', '1'];
    const particlesCount = 200;

    for (let i = 0; i < particlesCount; i++) {
        const digit = binaryDigits[Math.floor(Math.random() * binaryDigits.length)];
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 64;

        // Draw binary digit on canvas
        context.fillStyle = 'Red';
        context.font = '48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(digit, canvas.width / 2, canvas.height / 2);

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(spriteMaterial);

        // Randomize position
        sprite.position.set(
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4
        );

        // Randomize scale
        sprite.scale.set(0.2, 0.2, 0.2);

        binaryGroup.add(sprite);
    }

    scene.add(binaryGroup);

    // Camera position
    camera.position.z = 5;

    // Add orbit controls for interactivity
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Rotate the binary group
        binaryGroup.rotation.x += 0.002;
        binaryGroup.rotation.y += 0.002;

        // Update controls
        controls.update();
        renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // Add mouse interaction for 3D scene
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    
    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
        mouseY = ((e.clientY - rect.top) / container.clientHeight) * 2 - 1;
        
        targetRotationY = mouseX * Math.PI * 0.15;
        targetRotationX = mouseY * Math.PI * 0.15;
        
        // Smoother interpolation
        techSphere.rotation.x += (targetRotationX - techSphere.rotation.x) * 0.05;
        techSphere.rotation.y += (targetRotationY - techSphere.rotation.y) * 0.05;
    });

    // Reset rotation when mouse leaves container
    container.addEventListener('mouseleave', () => {
        targetRotationX = 0;
        targetRotationY = 0;
    });
}

// Mobile menu toggle
document.querySelector('.md\\:hidden').addEventListener('click', function() {
    const menu = document.querySelector('.hidden.md\\:flex');
    menu.classList.toggle('hidden');
    menu.classList.toggle('flex');
    menu.classList.toggle('flex-col');
    menu.classList.toggle('absolute');
    menu.classList.toggle('top-16');
    menu.classList.toggle('right-6');
    menu.classList.toggle('bg-white');
    menu.classList.toggle('p-4');
    menu.classList.toggle('rounded-lg');
    menu.classList.toggle('shadow-lg');
});

document.querySelector('footer').innerHTML = document.querySelector('footer').innerHTML.replace('{new Date().getFullYear()}', new Date().getFullYear());
