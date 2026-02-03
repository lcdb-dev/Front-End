// Dynamic client-side translation system
// This allows instant page translation without reload

export interface TranslationsData {
  [lang: string]: {
    [key: string]: any;
  };
}

let translationsData: TranslationsData = {};
let currentLanguage: string = 'en';

/**
 * Initialize translations - load all translation files
 */
export async function initializeTranslations(): Promise<void> {
  try {
    // Import all translation files
    const languages = ['en', 'fr', 'es', 'pt-br', 'ar'];
    
    for (const lang of languages) {
      try {
        // For Astro, we import the JSON directly
        const translations = await import(`../i18n/${lang}.json`);
        translationsData[lang] = translations.default || translations;
      } catch (error) {
        console.warn(`Failed to load ${lang} translations:`, error);
      }
    }

    // Load saved language preference
    const savedLang = localStorage.getItem('preferred-language');
    if (savedLang && Object.keys(translationsData).includes(savedLang)) {
      currentLanguage = savedLang;
    }

    console.log('✓ Translations initialized for languages:', Object.keys(translationsData).join(', '));
  } catch (error) {
    console.error('Failed to initialize translations:', error);
  }
}

/**
 * Get translation for a key using dot notation
 */
export function getTranslation(key: string, lang?: string): string {
  const targetLang = lang || currentLanguage;
  const parts = key.split('.');
  
  if (!translationsData[targetLang]) {
    return key;
  }

  let current: any = translationsData[targetLang];

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      // Fallback to English
      if (targetLang !== 'en' && translationsData['en']) {
        current = translationsData['en'];
        for (const p of parts) {
          if (current && typeof current === 'object' && p in current) {
            current = current[p];
          } else {
            return key;
          }
        }
      }
      return key;
    }
  }

  return typeof current === 'string' ? current : key;
}

/**
 * Translate all elements with data-i18n attributes
 */
export function translatePageContent(): void {
  const elementsWithI18n = document.querySelectorAll('[data-i18n]');
  
  elementsWithI18n.forEach((element) => {
    const key = element.getAttribute('data-i18n');
    const type = element.getAttribute('data-i18n-type') || 'text';
    
    if (key) {
      const translation = getTranslation(key);
      
      if (type === 'placeholder') {
        // Handle placeholder attributes
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          element.placeholder = translation;
        }
      } else {
        // Handle text content
        element.textContent = translation;
      }
    }
  });

  // Trigger custom event for other components to update
  window.dispatchEvent(new CustomEvent('page-translated', { detail: { lang: currentLanguage } }));
}

/**
 * Change language and update entire page
 */
export async function changeLanguage(newLang: string): Promise<void> {
  if (!Object.keys(translationsData).includes(newLang)) {
    console.error(`Language ${newLang} not available`);
    return;
  }

  currentLanguage = newLang;
  localStorage.setItem('preferred-language', newLang);
  
  // Update HTML lang attribute
  document.documentElement.lang = newLang;
  document.documentElement.setAttribute('data-lang', newLang);
  
  // Translate page content
  translatePageContent();
  
  console.log(`✓ Language changed to: ${newLang}`);
}

/**
 * Get current language
 */
export function getCurrentLanguage(): string {
  return currentLanguage;
}

/**
 * Set up language switcher handlers
 */
export function setupLanguageSwitcher(): void {
  // Listen for language button clicks
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    
    if (target.classList.contains('lang-btn')) {
      const lang = target.getAttribute('data-lang');
      if (lang) {
        // Just change the language - let the appropriate handler take care of content
        changeLanguage(lang);
        
        // Update button states
        document.querySelectorAll('.lang-btn').forEach((btn) => {
          const btnLang = btn.getAttribute('data-lang');
          if (btnLang === lang) {
            btn.classList.add('active');
            btn.classList.remove('inactive');
            btn.setAttribute('aria-pressed', 'true');
          } else {
            btn.classList.remove('active');
            btn.classList.add('inactive');
            btn.setAttribute('aria-pressed', 'false');
          }
        });
      }
    }
  });
}

/**
 * Watch for localStorage changes (from other tabs/windows)
 */
export function watchLanguageChanges(): void {
  window.addEventListener('storage', (e) => {
    if (e.key === 'preferred-language' && e.newValue && e.newValue !== currentLanguage) {
      changeLanguage(e.newValue);
    }
  });
}
