import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// const config = {
//   ...appConfig,
//   providers: [
//     ...appConfig.providers, // Ensure existing providers are included
//     provideHttpClient(withInterceptorsFromDi())
//   ]
// };

bootstrapApplication(AppComponent)
  .catch((err) => console.error(err));
