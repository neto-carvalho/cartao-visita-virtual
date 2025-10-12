/* ==========================================================================
   MAIN.JS - Scripts para a página inicial
   ========================================================================== */

// Inicializar página principal
document.addEventListener('DOMContentLoaded', () => {
    initializeMainPage();
});

const initializeMainPage = () => {
    console.log('🏠 Inicializando página principal...');
    
    initializeHeroAnimations();
    initializeCarousel();
    initializeScrollEffects();
    initializeCTAButtons();
    
    console.log('✅ Página principal inicializada');
};

// ==========================================================================
// ANIMAÇÕES DO HERO
// ==========================================================================

const initializeHeroAnimations = () => {
    // Animar formas flutuantes
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach((shape, index) => {
        shape.style.animationDelay = `${index * 0.5}s`;
    });
    
    // Animar ícones flutuantes
    const floatingIcons = document.querySelectorAll('.floating-icon');
    floatingIcons.forEach((icon, index) => {
        icon.style.animationDelay = `${index * 0.3}s`;
    });
    
    // Animar indicador de scroll
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        setTimeout(() => {
            scrollIndicator.style.opacity = '1';
        }, 2000);
    }
};

// ==========================================================================
// CAROUSEL DE EXEMPLOS
// ==========================================================================

const initializeCarousel = () => {
    const track = document.getElementById('carouselTrack');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsContainer = document.getElementById('carouselDots');
    
    if (!track || slides.length === 0) return;
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    
    // Criar dots
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.classList.add('carousel-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    const dots = document.querySelectorAll('.carousel-dot');
    
    // Função para ir para um slide específico
    const goToSlide = (index) => {
        currentSlide = index;
        const offset = -currentSlide * 100;
        track.style.transform = `translateX(${offset}%)`;
        
        // Atualizar dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    };
    
    // Botão anterior
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            goToSlide(currentSlide);
        });
    }
    
    // Botão próximo
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % totalSlides;
            goToSlide(currentSlide);
        });
    }
    
    // Auto-play (opcional)
    setInterval(() => {
        currentSlide = (currentSlide + 1) % totalSlides;
        goToSlide(currentSlide);
    }, 5000);
    
    // Suporte para touch/swipe em mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    const handleSwipe = () => {
        if (touchEndX < touchStartX - 50) {
            // Swipe left
            currentSlide = (currentSlide + 1) % totalSlides;
            goToSlide(currentSlide);
        }
        if (touchEndX > touchStartX + 50) {
            // Swipe right
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            goToSlide(currentSlide);
        }
    };
};

// ==========================================================================
// EFEITOS DE SCROLL
// ==========================================================================

const initializeScrollEffects = () => {
    // Intersection Observer para animações de entrada
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observar elementos que devem animar
    const animatedElements = document.querySelectorAll('.feature-card, .section-header');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Parallax para formas flutuantes
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const shapes = document.querySelectorAll('.shape');
        
        shapes.forEach((shape, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrolled * speed);
            shape.style.transform = `translateY(${yPos}px) rotate(${scrolled * 0.1}deg)`;
        });
    });
};

// ==========================================================================
// BOTÕES CTA
// ==========================================================================

const initializeCTAButtons = () => {
    // Efeito de brilho nos botões
    const ctaButtons = document.querySelectorAll('.cta-button.primary');
    
    ctaButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            const glow = button.querySelector('.button-glow');
            if (glow) {
                glow.style.left = '100%';
            }
        });
        
        button.addEventListener('mouseleave', () => {
            const glow = button.querySelector('.button-glow');
            if (glow) {
                glow.style.left = '-100%';
            }
        });
    });
    
    // Animação de pulso para estatísticas
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        let currentValue = 0;
        const targetValue = parseInt(stat.textContent.replace(/[^\d]/g, ''));
        const increment = targetValue / 50;
        
        const updateNumber = () => {
            if (currentValue < targetValue) {
                currentValue += increment;
                const displayValue = Math.floor(currentValue);
                
                if (stat.textContent.includes('K+')) {
                    stat.textContent = `${Math.floor(displayValue / 1000)}K+`;
                } else if (stat.textContent.includes('%')) {
                    stat.textContent = `${displayValue}%`;
                } else {
                    stat.textContent = stat.textContent.replace(/\d+/, displayValue);
                }
                
                requestAnimationFrame(updateNumber);
            }
        };
        
        // Iniciar animação quando o elemento estiver visível
        const statObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateNumber();
                    statObserver.unobserve(entry.target);
                }
            });
        });
        
        statObserver.observe(stat);
    });
};

// ==========================================================================
// FUNÇÕES GLOBAIS
// ==========================================================================

// Mostrar demonstração
window.showDemo = () => {
    // Scroll suave para a seção de features
    const featuresSection = document.querySelector('.features-section');
    if (featuresSection) {
        featuresSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
    
    // Destacar primeiro feature card
    setTimeout(() => {
        const firstFeature = document.querySelector('.feature-card');
        if (firstFeature) {
            firstFeature.style.transform = 'scale(1.05)';
            firstFeature.style.boxShadow = '0 20px 40px rgba(0, 191, 255, 0.2)';
            
            setTimeout(() => {
                firstFeature.style.transform = '';
                firstFeature.style.boxShadow = '';
            }, 2000);
        }
    }, 1000);
};

// Scroll para editor (função global)
window.scrollToEditor = () => {
    // Redirecionar para o editor
    window.location.href = 'editor.html';
};

// ==========================================================================
// UTILITÁRIOS ESPECÍFICOS DA PÁGINA PRINCIPAL
// ==========================================================================

// Efeito de typing no título
const typeWriter = (element, text, speed = 100) => {
    let i = 0;
    element.innerHTML = '';
    
    const type = () => {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    };
    
    type();
};

// Animar contadores
const animateCounters = () => {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/[^\d]/g, ''));
        const increment = target / 60;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                const displayValue = Math.floor(current);
                
                if (counter.textContent.includes('K+')) {
                    counter.textContent = `${Math.floor(displayValue / 1000)}K+`;
                } else if (counter.textContent.includes('%')) {
                    counter.textContent = `${displayValue}%`;
                } else {
                    counter.textContent = displayValue;
                }
                
                requestAnimationFrame(updateCounter);
            }
        };
        
        // Iniciar quando visível
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(counter);
    });
};

// Inicializar contadores quando a página carregar
setTimeout(animateCounters, 1000);

// ==========================================================================
// PERFORMANCE E OTIMIZAÇÕES
// ==========================================================================

// Lazy loading para imagens
const initializeLazyLoading = () => {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
};

// Preload de recursos críticos
const preloadCriticalResources = () => {
    const criticalImages = [
        'assets/images/hero-bg.jpg',
        'assets/images/feature-1.svg',
        'assets/images/feature-2.svg',
        'assets/images/feature-3.svg'
    ];
    
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
};

// Inicializar otimizações
initializeLazyLoading();
preloadCriticalResources();
