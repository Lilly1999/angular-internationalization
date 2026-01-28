
import { Component, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { LabelComponent } from '../../form/label/label.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { I18nService } from '../../../services/i18n.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-signin-form',
  imports: [
    LabelComponent,
    CheckboxComponent,
    ButtonComponent,
    InputFieldComponent,
    RouterModule,
    FormsModule,
    TranslatePipe
  ],
  templateUrl: './signin-form.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SigninFormComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  showPassword = false;
  isChecked = false;

  email = '';
  password = '';

  constructor(private i18nService: I18nService, private cdr: ChangeDetectorRef) {
    // Subscribe to language changes to trigger re-rendering
    this.i18nService.currentLanguage$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      // Manually trigger change detection to ensure TranslatePipe re-evaluates
      this.cdr.markForCheck();
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignIn() {
    console.log('Email:', this.email);
    console.log('Password:', this.password);
    console.log('Remember Me:', this.isChecked);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
