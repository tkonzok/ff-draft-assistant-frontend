import { Injectable } from '@angular/core';
import { CanActivate, UrlTree } from '@angular/router';
import { Observable, filter, first, map } from 'rxjs';
import { MasterDataInitStatus, MasterDataService } from '../domain/master-data.service';

@Injectable({
  providedIn: 'root',
})
export class AppGuard implements CanActivate {
  constructor(private masterDataService: MasterDataService) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.masterDataService.initStatus$.pipe(
      filter((initStatus: MasterDataInitStatus) => initStatus === MasterDataInitStatus.SUCCESS),
      first(),
      map(() => true),
    );
  }
}
