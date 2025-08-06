// Configuration globale
const CONFIG = {
    PRODUCTS_JSON: 'products.json',
    ANIMATION_DURATION: 300,
    CAROUSEL_AUTO_PLAY: false
};

// Variables globales
let productsData = [];
let currentProduct = null;
let currentCarouselIndex = 0;

// Utilitaires
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Fonction pour charger les données des produits
async function loadProducts() {
    console.log('Chargement des produits depuis:', CONFIG.PRODUCTS_JSON);
    try {
        const response = await fetch(CONFIG.PRODUCTS_JSON);
        console.log('Réponse reçue, status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Données JSON parsées:', data);
        
        productsData = data.products || [];
        console.log('Produits chargés avec succès:', productsData.length, 'produits');
        
        return productsData;
    } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        console.error('Détails de l\'erreur:', error.message);
        return [];
    }
}

// Fonction pour formater le prix
function formatPrice(price, currency = 'EUR') {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency
    }).format(price);
}

// Fonction pour créer une carte produit
function createProductCard(product) {
    const formatsHtml = product.formats
        .map(format => `<span class="format-tag">${format}</span>`)
        .join('');

    // Utiliser la description courte ou longue si la courte n'existe pas
    const description = product.short_description || product.long_description || product.description || 'Description non disponible';

    return `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                <img src="${product.images[0]}" alt="${product.title}" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-subtitle">${product.subtitle}</p>
                <div class="product-price">${formatPrice(product.price, product.currency)}</div>
                <div class="product-formats">${formatsHtml}</div>
                <p class="product-description">${description}</p>
                <button class="btn-preview" onclick="openProductModal(${product.id})">
                    Aperçu rapide
                </button>
            </div>
        </div>
    `;
}

// Fonction pour afficher les produits phares sur la page d'accueil
function displayFeaturedProducts() {
    console.log('Affichage des produits phares...');
    const container = $('#featuredProducts');
    if (!container) {
        console.error('Container #featuredProducts non trouvé');
        return;
    }

    const featuredProducts = productsData.filter(product => product.featured);
    console.log('Produits phares trouvés:', featuredProducts.length);
    
    if (featuredProducts.length === 0) {
        console.warn('Aucun produit phare trouvé');
        container.innerHTML = '<p style="text-align: center; color: #666;">Aucun produit phare disponible pour le moment.</p>';
        return;
    }
    
    const productsHtml = featuredProducts
        .map(product => createProductCard(product))
        .join('');

    container.innerHTML = productsHtml;
    console.log('HTML des produits inséré dans le container');

    // Ajouter l'animation d'apparition
    setTimeout(() => {
        const cards = container.querySelectorAll('.product-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'all 0.6s ease';
                
                requestAnimationFrame(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                });
            }, index * 150);
        });
    }, 100);
}

// Fonction pour afficher tous les produits sur la page catalogue
function displayAllProducts() {
    const container = $('#catalogueProducts');
    if (!container) return;

    const productsHtml = productsData
        .map(product => createProductCard(product))
        .join('');

    container.innerHTML = productsHtml;

    // Animation d'apparition
    setTimeout(() => {
        const cards = container.querySelectorAll('.product-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'all 0.6s ease';
                
                requestAnimationFrame(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                });
            }, index * 100);
        });
    }, 100);
}

// Fonction pour ouvrir la modale produit
function openProductModal(productId) {
    console.log('Tentative d\'ouverture de la modale pour le produit:', productId);
    console.log('Données des produits disponibles:', productsData.length, 'produits');
    
    const product = productsData.find(p => p.id === productId);
    if (!product) {
        console.error('Produit non trouvé avec l\'ID:', productId);
        return;
    }

    currentProduct = product;
    console.log('Produit trouvé:', product.title);
    
    const modal = $('#productModal');
    console.log('Modal trouvée:', modal ? 'Oui' : 'Non');
    
    // Vérifier si la modale existe
    if (!modal) {
        console.warn('Modale produit non trouvée - Tentative de réinitialisation...');
        // Attendre un peu et réessayer
        setTimeout(() => {
            const modalRetry = $('#productModal');
            if (modalRetry) {
                console.log('Modale trouvée après délai');
                openProductModal(productId);
            } else {
                console.error('Modale toujours non trouvée après délai');
            }
        }, 100);
        return;
    }
    
    // Remplir le contenu de la modale avec vérifications
    const modalTitle = $('#modalTitle');
    const modalSubtitle = $('#modalSubtitle');
    const modalPrice = $('#modalPrice');
    const modalDescription = $('#modalDescription');
    const modalFormats = $('#modalFormats');
    const modalIncludesList = $('#modalIncludesList');
    const modalViewMore = $('#modalViewMore');
    
    if (modalTitle) modalTitle.textContent = product.title;
    if (modalSubtitle) modalSubtitle.textContent = product.subtitle;
    if (modalPrice) modalPrice.innerHTML = formatPrice(product.price, product.currency);
    
    // Utiliser la description courte ou longue si la courte n'existe pas
    const modalDescriptionText = product.short_description || product.long_description || product.description || 'Description non disponible';
    if (modalDescription) modalDescription.textContent = modalDescriptionText;

    // Formats
    if (modalFormats) {
        const formatsHtml = product.formats
            .map(format => `<span class="format-tag">${format}</span>`)
            .join('');
        modalFormats.innerHTML = formatsHtml;
    }

    // Inclusions
    if (modalIncludesList) {
        const includesHtml = product.includes
            .map(item => `<li>${item}</li>`)
            .join('');
        modalIncludesList.innerHTML = includesHtml;
    }

    // Lien vers la page produit
    if (modalViewMore) modalViewMore.href = `produit.html?slug=${product.slug}`;

    // Initialiser le carousel
    initModalCarousel(product.images);

    // Afficher la modale
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Fonction pour fermer la modale
function closeProductModal() {
    const modal = $('#productModal');
    if (modal) {
        modal.classList.remove('active');
    }
    document.body.style.overflow = '';
    currentProduct = null;
    currentCarouselIndex = 0;
}

// Fonction pour initialiser le carousel de la modale
function initModalCarousel(images) {
    const track = $('#carouselTrack');
    const indicators = $('#carouselIndicators');
    
    // Créer les slides
    const slidesHtml = images
        .map(image => `
            <div class="carousel-slide">
                <img src="${image}" alt="Image produit" loading="lazy">
            </div>
        `)
        .join('');
    track.innerHTML = slidesHtml;

    // Créer les indicateurs
    const indicatorsHtml = images
        .map((_, index) => `
            <div class="indicator ${index === 0 ? 'active' : ''}" 
                 onclick="goToSlide(${index})"></div>
        `)
        .join('');
    indicators.innerHTML = indicatorsHtml;

    currentCarouselIndex = 0;
    updateCarouselPosition();
}

// Fonction pour naviguer dans le carousel
function goToSlide(index) {
    const images = currentProduct?.images || [];
    if (index < 0 || index >= images.length) return;

    currentCarouselIndex = index;
    updateCarouselPosition();
}

// Fonction pour mettre à jour la position du carousel
function updateCarouselPosition() {
    const track = $('#carouselTrack');
    const indicators = $$('.indicator');
    
    if (track) {
        track.style.transform = `translateX(-${currentCarouselIndex * 100}%)`;
    }

    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentCarouselIndex);
    });
}

// Fonction pour naviguer vers la slide précédente
function previousSlide() {
    const images = currentProduct?.images || [];
    const newIndex = currentCarouselIndex === 0 ? images.length - 1 : currentCarouselIndex - 1;
    goToSlide(newIndex);
}

// Fonction pour naviguer vers la slide suivante
function nextSlide() {
    const images = currentProduct?.images || [];
    const newIndex = currentCarouselIndex === images.length - 1 ? 0 : currentCarouselIndex + 1;
    goToSlide(newIndex);
}

// Fonction pour obtenir un produit par slug
function getProductBySlug(slug) {
    return productsData.find(product => product.slug === slug);
}

// Fonction pour formater la date
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Fonction pour initialiser la page produit
async function initProductPage() {
    await loadProducts();
    
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    
    if (!slug) {
        window.location.href = 'catalogue.html';
        return;
    }

    const product = getProductBySlug(slug);
    if (!product) {
        window.location.href = 'catalogue.html';
        return;
    }

    // Mettre à jour le titre de la page
    document.title = `${product.title} - Lumière Spirituelle`;
    $('#productPageTitle').textContent = `${product.title} - Lumière Spirituelle`;

    // Remplir les informations du produit
    fillProductDetails(product);
    
    // Afficher les produits liés
    displayRelatedProducts(product);
}

// Fonction pour remplir les détails du produit
function fillProductDetails(product) {
    // Breadcrumb
    $('#breadcrumbProduct').textContent = product.title;

    // Image principale
    $('#mainProductImage').src = product.images[0];
    $('#mainProductImage').alt = product.title;

    // Miniatures
    const thumbnailsHtml = product.images
        .map((image, index) => `
            <div class="thumbnail ${index === 0 ? 'active' : ''}" 
                 onclick="changeMainImage('${image}', ${index})">
                <img src="${image}" alt="${product.title}" loading="lazy">
            </div>
        `)
        .join('');
    $('#thumbnailImages').innerHTML = thumbnailsHtml;

    // Informations principales
    $('#productTitle').textContent = product.title;
    $('#productSubtitle').textContent = product.subtitle;
    $('#productPrice').innerHTML = formatPrice(product.price, product.currency);

    // Formats
    const formatsHtml = product.formats
        .map(format => `<span class="format-tag">${format}</span>`)
        .join('');
    $('#productFormats').innerHTML = formatsHtml;

    // Métadonnées
    $('#productCategory').textContent = product.category;
    $('#productSku').textContent = product.sku;
    $('#productReleaseDate').textContent = formatDate(product.release_date);

    // Description longue
    const descriptionParagraphs = product.long_description.split('\n')
        .map(paragraph => `<p>${paragraph}</p>`)
        .join('');
    $('#productDescription').innerHTML = descriptionParagraphs;

    // Inclusions
    const includesHtml = product.includes
        .map(item => `<li>${item}</li>`)
        .join('');
    $('#productIncludes').innerHTML = includesHtml;

    // Spécifications techniques
    $('#productLanguage').textContent = product.language;
    $('#productPages').textContent = `${product.pages} pages`;
    $('#productFileSize').textContent = product.file_size;
    $('#productDelivery').textContent = product.delivery;
    $('#productAuthor').textContent = product.author;
}

// Fonction pour changer l'image principale
function changeMainImage(imageSrc, index) {
    const mainImage = $('#mainProductImage');
    const thumbnails = $$('.thumbnail');

    mainImage.src = imageSrc;

    thumbnails.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

// Fonction pour afficher les produits liés
function displayRelatedProducts(currentProduct) {
    const container = $('#relatedProducts');
    if (!container) return;

    const relatedProducts = productsData
        .filter(product => 
            product.id !== currentProduct.id && 
            (product.category === currentProduct.category || product.featured)
        )
        .slice(0, 3);

    const productsHtml = relatedProducts
        .map(product => createProductCard(product))
        .join('');

    container.innerHTML = productsHtml;
}

// Fonction pour initialiser la page catalogue
async function initCatalogue() {
    await loadProducts();
    displayAllProducts();
}

// Fonction pour initialiser la page d'accueil
async function initHomePage() {
    console.log('Initialisation de la page d\'accueil...');
    try {
        await loadProducts();
        console.log('Produits chargés:', productsData.length);
        displayFeaturedProducts();
        console.log('Produits phares affichés');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la page d\'accueil:', error);
    }
}

// Fonction pour initialiser le menu mobile
function initMobileMenu() {
    const hamburger = $('.hamburger');
    const navMenu = $('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Fermer le menu lors du clic sur un lien
        navMenu.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                navMenu.classList.remove('active');
            }
        });

        // Fermer le menu lors du clic à l'extérieur
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });
    }
}

// Fonction pour gérer le défilement de la navbar
function initNavbarScroll() {
    const navbar = $('.navbar');
    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
}

// Event listeners globaux
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le menu mobile
    initMobileMenu();
    
    // Initialiser le défilement de la navbar
    initNavbarScroll();

    // Initialiser la page d'accueil si on y est
    const currentPath = window.location.pathname;
    const isHomePage = currentPath.includes('index.html') || 
                       currentPath === '/' || 
                       currentPath.endsWith('/') ||
                       currentPath === '' ||
                       !currentPath.includes('.html');
    
    if (isHomePage) {
        initHomePage();
    }

    // Event listeners pour la modale
    const modalClose = $('#modalClose');
    const modal = $('#productModal');
    const prevBtn = $('#prevBtn');
    const nextBtn = $('#nextBtn');

    if (modalClose) {
        modalClose.addEventListener('click', closeProductModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeProductModal();
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', previousSlide);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }

    // Gestion des touches du clavier pour la modale
    document.addEventListener('keydown', (e) => {
        if (modal && modal.classList.contains('active')) {
            switch(e.key) {
                case 'Escape':
                    closeProductModal();
                    break;
                case 'ArrowLeft':
                    previousSlide();
                    break;
                case 'ArrowRight':
                    nextSlide();
                    break;
            }
        }
    });

    // Smooth scroll pour les liens d'ancrage
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Récupérer le href actuel au moment du clic (peut avoir été modifié par JS)
            const currentHref = this.getAttribute('href');
            
            // Vérifier que c'est bien un lien d'ancrage valide
            if (!currentHref || !currentHref.startsWith('#') || currentHref === '#' || currentHref.includes('.html')) {
                return; // Laisser le comportement par défaut pour les liens vers d'autres pages
            }
            
            e.preventDefault();
            
            try {
                const target = document.querySelector(currentHref);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            } catch (error) {
                console.warn('Sélecteur d\'ancrage invalide:', currentHref, error);
                // En cas d'erreur, ne pas empêcher le comportement par défaut
            }
        });
    });
});

// Fonction pour gérer les boutons de téléchargement
function handleDownload(productId) {
    // Simuler un téléchargement
    console.log(`Téléchargement du produit ${productId}`);
    alert('Téléchargement démarré ! (Fonctionnalité de démonstration)');
}

// Attacher la fonction de téléchargement aux boutons
document.addEventListener('click', (e) => {
    if (e.target.id === 'modalDownload' || e.target.id === 'downloadBtn') {
        const productId = currentProduct ? currentProduct.id : null;
        if (productId) {
            handleDownload(productId);
        }
    }
});

// Fonctions utilitaires pour l'animation
function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';

    let opacity = 0;
    const timer = setInterval(() => {
        opacity += 50 / duration;
        if (opacity >= 1) {
            clearInterval(timer);
            opacity = 1;
        }
        element.style.opacity = opacity;
    }, 50);
}

function fadeOut(element, duration = 300) {
    let opacity = 1;
    const timer = setInterval(() => {
        opacity -= 50 / duration;
        if (opacity <= 0) {
            clearInterval(timer);
            opacity = 0;
            element.style.display = 'none';
        }
        element.style.opacity = opacity;
    }, 50);
}

// Observer d'intersection pour l'animation des éléments
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

// Observer les éléments avec animation au défilement
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = $$('.product-card, .category-card, .about-text');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
});