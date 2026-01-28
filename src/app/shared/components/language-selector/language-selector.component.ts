import { Component, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject, takeUntil, map } from 'rxjs';
import { I18nService } from '../../services/i18n.service';

interface LanguageInfo {
  code: string;
  name: string;
  flag: string;
}

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageSelectorComponent implements OnDestroy {
  availableLanguages: LanguageInfo[];
  currentLanguageInfo$: Observable<LanguageInfo | undefined>;
  private destroy$ = new Subject<void>();
  isDropdownOpen = false;

  constructor(private i18nService: I18nService, private cdr: ChangeDetectorRef, private el: ElementRef) {
    this.availableLanguages = this.i18nService.getAvailableLanguages();
    
    // Transform language code to language info
    this.currentLanguageInfo$ = this.i18nService.currentLanguage$.pipe(
      takeUntil(this.destroy$),
      map(lang => this.availableLanguages.find(l => l.code === lang))
    );
    
    // Subscribe to language changes to trigger re-rendering
    this.i18nService.currentLanguage$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  getCurrentLanguageInfo(): LanguageInfo | undefined {
    return this.availableLanguages.find(lang => lang.code === 'en');
  }

  async changeLanguage(languageCode: string): Promise<void> {
    await this.i18nService.changeLanguage(languageCode);
    // Hide dropdown after language selection
    this.isDropdownOpen = false;
    this.cdr.markForCheck();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    this.cdr.markForCheck();
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
    this.cdr.markForCheck();
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(targetElement: EventTarget | null) {
    if (targetElement && !this.el.nativeElement.contains(targetElement) && this.isDropdownOpen) {
      this.closeDropdown();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
