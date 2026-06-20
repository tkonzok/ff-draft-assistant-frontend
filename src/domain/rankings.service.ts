import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { environment } from '../environments/environment';

export interface RankingPlayerDto {
  id: string;
  name: string;
  ovr: string;
  rank: string;
  tier: string;
}

export interface UpdateRankingDto {
  ranking: string;
  players: RankingPlayerDto[];
}

@Injectable({
  providedIn: 'root',
})
export class RankingsService {
  private static readonly RANKINGS_URL: string = `${environment.apiUrl}/players/rankings`;

  constructor(private http: HttpClient) {}

  updateRanking(dto: UpdateRankingDto): Observable<void> {
    return this.http.put<void>(RankingsService.RANKINGS_URL, dto).pipe(take(1));
  }
}
