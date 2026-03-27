const translations = {
    en: {
        navSearch: "&#128269; Search",
        navHome: "Home",
        navDocs: "Docs",
        navBlog: "Blog",
        navAbout: "About",
        heroTitle: "Marketing Cloud Arcade",
        heroSubtitle: "Level up your Salesforce Marketing Cloud development skills",
        heroDesc: "Your retro-fueled hub for advanced SFMC knowledge, architecture, and coding best practices.",
        ctaDocs: "Start Learning",
        ctaBlog: "Latest Articles",
        docsTitle: "Documentation Levels",
        blogTitle: "Transmission Logs",
        blogSubtitle: "System updates, thought processes, and architectural deep dives.",
        showMore: "Load More Logs \\/",
        showLess: "Show Less Pixels >_",
        searchPlaceholder: "Scanning...",
        tagAll: "All",
        tagFound: "Foundations",
        tagDev: "Development",
        tagApi: "API",
        tagData: "Data",
        markCompleteBtn: "MARK AS COMPLETED",
        markCompleteBtnDone: "✓ COMPLETED",
        overview: "Overview",
        whyItMatters: "Why it matters in SFMC",
        howItWorks: "How it works",
        whenToUse: "When to use this approach",
        exImpl: "Example Implementation",
        visRef: "Visual Reference",
        bestPrac: "Best Practices",
        commonMistakes: "Common Mistakes",
        offDocs: "Official Documentation & References",
        readRecord: "READ RECORD",
        aboutP1: "I focus on providing practical, developer-centric knowledge for Salesforce Marketing Cloud. Forget the fluff—this is about real-world architecture, scalable automations, and overcoming platform quirks.",
        aboutP2: "Level up your engineering skills.",
        "Foundations": "Foundations",
        "Data & SQL": "Data & SQL",
        "Content & Personalization": "Content & Personalization",
        "Development": "Development",
        "Automation & Journeys": "Automation & Journeys",
        "Integrations / API": "Integrations / API",
        "Deliverability": "Deliverability",
        "Security & Governance": "Security & Governance",
        "Troubleshooting": "Troubleshooting",
        "Uncategorized": "Uncategorized"
    },
    es: {
        navSearch: "&#128269; Buscar",
        navHome: "Inicio",
        navDocs: "Docs",
        navBlog: "Blog",
        navAbout: "Acerca de",
        heroTitle: "Marketing Cloud Arcade",
        heroSubtitle: "Eleva tus habilidades de desarrollo en Salesforce Marketing Cloud",
        heroDesc: "Tu centro retro para conocimiento avanzado de SFMC, arquitectura y mejores prácticas.",
        ctaDocs: "Empezar a Aprender",
        ctaBlog: "Últimos Artículos",
        docsTitle: "Niveles de Documentación",
        blogTitle: "Registros de Transmisión",
        blogSubtitle: "Actualizaciones del sistema, procesos de pensamiento y análisis arquitectónicos.",
        showMore: "Cargar Más Logs \\/",
        showLess: "Mostrar Menos Píxeles >_",
        searchPlaceholder: "Escaneando...",
        tagAll: "Todos",
        tagFound: "Fundamentos",
        tagDev: "Desarrollo",
        tagApi: "API",
        tagData: "Datos",
        markCompleteBtn: "MARCAR COMO COMPLETADO",
        markCompleteBtnDone: "✓ COMPLETADO",
        overview: "Resumen",
        whyItMatters: "Por qué importa en SFMC",
        howItWorks: "Cómo funciona",
        whenToUse: "Cuándo usar este enfoque",
        exImpl: "Ejemplo de Implementación",
        visRef: "Referencia Visual",
        bestPrac: "Mejores Prácticas",
        commonMistakes: "Errores Comunes",
        offDocs: "Documentación Oficial y Referencias",
        readRecord: "LEER REGISTRO",
        aboutP1: "Me enfoco en proporcionar conocimiento práctico y centrado en el desarrollador para Salesforce Marketing Cloud. Olvídate del relleno: se trata de arquitectura del mundo real, automatizaciones escalables y superar las peculiaridades de la plataforma.",
        aboutP2: "Sube de nivel tus habilidades de ingeniería.",
        "Foundations": "Fundamentos",
        "Data & SQL": "Datos y SQL",
        "Content & Personalization": "Contenido y Personalización",
        "Development": "Desarrollo",
        "Automation & Journeys": "Automatización y Journeys",
        "Integrations / API": "Integraciones / API",
        "Deliverability": "Entregabilidad",
        "Security & Governance": "Seguridad y Gobernanza",
        "Troubleshooting": "Solución de Problemas",
        "Uncategorized": "Sin Categoría"
    }
};

class I18nManager {
    constructor() {
        this.currentLang = localStorage.getItem('arcade-lang') || 'en';
        this.init();
    }

    init() {
        // Wait for DOM to be ready before applying translations and event listeners
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        this.applyTranslations();
        this.setupToggleButton();
    }

    setLanguage(lang) {
        if (translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('arcade-lang', lang);
            this.applyTranslations();
            // Dispatch a global event so other components (like blog and docs) can re-fetch translated data
            document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
            this.updateToggleButton();
        }
    }

    t(key) {
        return translations[this.currentLang][key] || key;
    }

    toggleLanguage() {
        const newLang = this.currentLang === 'en' ? 'es' : 'en';
        this.setLanguage(newLang);
    }

    applyTranslations() {
        const elements = document.querySelectorAll('[data-i18n]');
        const dict = translations[this.currentLang];
        
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) {
                if (el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'search')) {
                    el.placeholder = dict[key];
                } else {
                    el.innerHTML = dict[key];
                }
            }
        });
    }

    setupToggleButton() {
        const checkbox = document.getElementById('lang-toggle-checkbox');
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                const newLang = e.target.checked ? 'es' : 'en';
                this.setLanguage(newLang);
            });
            this.updateToggleButton();
        }
    }

    updateToggleButton() {
        const checkbox = document.getElementById('lang-toggle-checkbox');
        const label = document.getElementById('lang-label');
        if (checkbox) {
            checkbox.checked = this.currentLang === 'es';
        }
        if (label) {
            label.textContent = this.currentLang === 'en' ? 'English' : 'Spanish';
        }
    }
}

// Initialize immediately so the manager is available globally
window.i18nManager = new I18nManager();
