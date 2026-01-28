import { Injectable } from '@angular/core';
import i18next from 'i18next';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { NgZone } from '@angular/core';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

interface LanguageInfo {
  code: string;
  name: string;
  flag: string;
}

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLanguageSubject = new BehaviorSubject<string>('en');
  currentLanguage$ = this.currentLanguageSubject.asObservable();
  private isInitialized = false;
  private initializationPromise!: Promise<void>;
  private globalListenerSetup = false;
  private destroy$ = new Subject<void>();
  
  // Global event for cross-instance communication
  private static globalLanguageChange$ = new BehaviorSubject<string>('en');

  // Public static method to trigger global language change
  static triggerGlobalLanguageChange(language: string): void {
    this.globalLanguageChange$.next(language);
  }

  constructor(private http: HttpClient, private ngZone: NgZone) {
    this.initializeI18n();
    this.setupGlobalListener();
    this.setupStaticListener();
  }

  private setupGlobalListener(): void {
    if (!this.globalListenerSetup) {
      // Listen to global i18next language changes
      i18next.on('languageChanged', (lng) => {
        this.ngZone.run(() => {
          this.currentLanguageSubject.next(lng);
          I18nService.globalLanguageChange$.next(lng);
        });
      });
      this.globalListenerSetup = true;
    }
  }

  private setupStaticListener(): void {
    // Listen to static language changes from other instances
    I18nService.globalLanguageChange$.pipe(takeUntil(this.destroy$)).subscribe((lng: string) => {
      this.ngZone.run(() => {
        this.currentLanguageSubject.next(lng);
      });
    });
  }

  private async initializeI18n(): Promise<void> {
    try {
      await i18next
        .use(HttpApi)
        .use(LanguageDetector)
        .init({
          debug: false,
          fallbackLng: 'en',
          supportedLngs: ['en', 'fr', 'sw'],
          interpolation: {
            escapeValue: false
          },
          backend: {
            loadPath: '/i18n/{{lng}}.json'
          },
          detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage']
          }
        });
      
      this.isInitialized = true;
      const savedLanguage = localStorage.getItem('preferred-language') || 'en';
      await this.changeLanguage(savedLanguage);
    } catch (error) {
      console.error('Failed to initialize i18next:', error);
    }
  }

  async changeLanguage(language: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initializationPromise;
    }
    
    try {
      // Change language using i18next which will trigger the global event
      await i18next.changeLanguage(language);
      // The global 'languageChanged' event will handle updating the subject
      // Also trigger static global language change for cross-instance communication
      I18nService.triggerGlobalLanguageChange(language);
      localStorage.setItem('preferred-language', language);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCurrentLanguage(): string {
    return i18next.language || 'en';
  }

  getCurrentLanguageInfo(): LanguageInfo | undefined {
    const currentLang = this.getCurrentLanguage();
    return this.getAvailableLanguages().find(lang => lang.code === currentLang);
  }

  async translate(key: string, options?: any): Promise<string> {
    if (!this.isInitialized) {
      await this.initializationPromise;
    }
    return i18next.t(key, options) as string;
  }

  translateSync(key: string, options?: any): string {
    if (!this.isInitialized) {
      // Return a more readable fallback instead of the raw key
      return this.getFallbackText(key);
    }
    return i18next.t(key, options) as string;
  }

  // Add a method to check if i18n is ready
  isReady(): boolean {
    return this.isInitialized && i18next.isInitialized;
  }

  // Add a method that waits for initialization
  async waitForInitialization(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializationPromise;
    }
  }

  private getFallbackText(key: string): string {
    const fallbacks: { [key: string]: string } = {
      // Auth fallbacks
      'auth.signInTitle': 'Sign In',
      'auth.signInDescription': 'Enter your email and password to sign in!',
      'auth.signUpTitle': 'Sign Up',
      'auth.signUpDescription': 'Enter your email and password to sign up!',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.forgotPassword': 'Forgot password?',
      'auth.signInButton': 'Sign in',
      'auth.signUpButton': 'Sign Up',
      'auth.dontHaveAccount': "Don't have an account?",
      'auth.alreadyHaveAccount': 'Already have an account?',
      'auth.signUp': 'Sign Up',
      'auth.signIn': 'Sign In',
      'auth.or': 'Or',
      'auth.backToDashboard': 'Back to dashboard',
      'auth.signInWithGoogle': 'Sign in with Google',
      'auth.signInWithX': 'Sign in with X',
      'auth.signUpWithGoogle': 'Sign up with Google',
      'auth.signUpWithX': 'Sign up with X',
      'auth.keepMeLoggedIn': 'Keep me logged in',
      'auth.emailPlaceholder': 'info@gmail.com',
      'auth.passwordPlaceholder': 'Enter your password',
      'auth.confirmPassword': 'Confirm Password',
      'auth.confirmPasswordPlaceholder': 'Confirm your password',
      // Sidebar fallbacks
      'sidebar.dashboard': 'Dashboard',
      'sidebar.ecommerce': 'E-commerce',
      'sidebar.calendar': 'Calendar',
      'sidebar.userProfile': 'User Profile',
      'sidebar.forms': 'Forms',
      'sidebar.formElements': 'Form Elements',
      'sidebar.tables': 'Tables',
      'sidebar.basicTables': 'Basic Tables',
      'sidebar.pages': 'Pages',
      'sidebar.blankPage': 'Blank Page',
      'sidebar.error404': '404 Error',
      'sidebar.uiElements': 'UI Elements',
      'sidebar.alerts': 'Alerts',
      'sidebar.avatars': 'Avatars',
      'sidebar.badge': 'Badge',
      'sidebar.buttons': 'Buttons',
      'sidebar.images': 'Images',
      'sidebar.videos': 'Videos',
      'sidebar.charts': 'Charts',
      'sidebar.lineChart': 'Line Chart',
      'sidebar.barChart': 'Bar Chart',
      // Common fallbacks
      'common.dashboard': 'Dashboard',
      'common.search': 'Search',
      'common.loading': 'Loading'
    };
    
    return fallbacks[key] || key;
  }

  getAvailableLanguages() {
    return [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'sw', name: 'Kiswahili', flag: '🇹🇿' }
    ];
  }
}
