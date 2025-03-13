import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker'; // Importar Service Worker
import { FinanzasService } from './app/services/finanzas.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    FinanzasService,
    provideServiceWorker('ngsw-worker.js', { enabled: true }) // Siempre habilitado
  ],
}).catch((err) => console.error(err));
