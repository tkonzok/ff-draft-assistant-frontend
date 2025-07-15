import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import 'reflect-metadata';
import { MasterDataService } from './domain/master-data.service';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
);
