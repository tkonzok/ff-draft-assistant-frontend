import { provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { provideIndexedDb } from 'ngx-indexed-db';
import { MasterDataService } from '../domain/master-data.service';
import { routes } from './app.routes';
import { INDEXED_DB_CONFIG } from './indexed-db-config';

export function initMasterdataFactory(masterDataService: MasterDataService) {
  return () => masterDataService.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    provideIndexedDb(INDEXED_DB_CONFIG),
    {
      provide: APP_INITIALIZER,
      useFactory: initMasterdataFactory,
      deps: [MasterDataService],
      multi: true,
    },
  ],
};
