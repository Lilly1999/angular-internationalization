import { Component, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { GridShapeComponent } from '../../components/common/grid-shape/grid-shape.component';
import { RouterModule } from '@angular/router';
import { ThemeToggleTwoComponent } from '../../components/common/theme-toggle-two/theme-toggle-two.component';
import { LanguageSelectorComponent } from '../../components/language-selector/language-selector.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { I18nService } from '../../services/i18n.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-auth-page-layout',
  imports: [
    GridShapeComponent,
    RouterModule,
    ThemeToggleTwoComponent,
    LanguageSelectorComponent,
    TranslatePipe
  ],
  templateUrl: './auth-page-layout.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthPageLayoutComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(private i18nService: I18nService, private cdr: ChangeDetectorRef) {
    // Subscribe to language changes to trigger re-rendering
    this.i18nService.currentLanguage$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      // Manually trigger change detection to ensure TranslatePipe re-evaluates
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
