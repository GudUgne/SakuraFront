import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

// Merge additional providers with appConfig
const updatedConfig = {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []), // Preserve existing providers
    provideHttpClient(), // Enables HttpClient
    provideRouter(routes) // Enables routing
  ]
};

bootstrapApplication(AppComponent, updatedConfig)
  .catch(err => console.error(err));
