import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import {AuthInterceptor} from './app/auth.interceptor';

// Merge additional providers with appConfig
const updatedConfig = {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []), // Preserve existing providers
    provideHttpClient(withInterceptorsFromDi()),            // Enables HttpClient
    provideRouter(routes),          // Enables routing
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ]
};

bootstrapApplication(AppComponent, updatedConfig)
  .catch(err => console.error(err));
