import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { I18nService } from '../services/i18n.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'translate',
  pure: false
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private subscription: Subscription;
  private lastKey: string = '';
  private lastOptions: any;
  private lastValue: string = '';
  private isInitialized: boolean = false;

  constructor(
    private i18nService: I18nService,
    private cdr: ChangeDetectorRef
  ) {
    // Subscribe to language changes
    this.subscription = this.i18nService.currentLanguage$.subscribe(() => {
      this.cdr.markForCheck();
    });

    // Check if i18n is already initialized
    this.checkInitialization();
  }

  private async checkInitialization(): Promise<void> {
    await this.i18nService.waitForInitialization();
    this.isInitialized = true;
    this.cdr.markForCheck();
  }

  transform(key: string, options?: any): string {
    // Always re-evaluate to ensure we get the latest translation
    this.lastKey = key;
    this.lastOptions = options;
    
    if (this.isInitialized) {
      this.lastValue = this.i18nService.translateSync(key, options);
    } else {
      // Use fallback while initializing
      this.lastValue = this.i18nService.translateSync(key, options);
      // Trigger initialization check
      this.checkInitialization();
    }
    
    return this.lastValue;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
