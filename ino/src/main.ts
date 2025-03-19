import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker'; // Importar Service Worker
import { FinanzasService } from './app/services/finanzas.service';
import { Chart, LineController, PieController, CategoryScale, LinearScale, ArcElement, PointElement, LineElement } from 'chart.js';

// Registra los controladores y escalas necesarios
Chart.register(LineController, PieController, CategoryScale, LinearScale, ArcElement, PointElement, LineElement);

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    FinanzasService,
    provideServiceWorker('ngsw-worker.js', { enabled: true }) // Siempre habilitado
  ],
}).catch((err) => console.error(err));
