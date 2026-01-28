import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { I18nService } from './shared/services/i18n.service';
import { TranslatePipe } from './shared/pipes/translate.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    TranslatePipe
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'Angular Ecommerce Dashboard | TailAdmin';
  isI18nReady = false;

  constructor(private i18nService: I18nService) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.i18nService.waitForInitialization();
      this.isI18nReady = true;
    } catch (error) {
      console.error('Failed to initialize i18n:', error);
      this.isI18nReady = true; // Show app even if i18n fails
    }
  }
}
