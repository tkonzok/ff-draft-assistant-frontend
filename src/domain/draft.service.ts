import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { plainToInstance } from 'class-transformer';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable, ReplaySubject, filter, map, of, switchMap, take, tap } from 'rxjs';
import { STORE_NAME_DRAFTS } from '../app/indexed-db-config';
import { environment } from '../environments/environment';
import { ObservableInstanceMapper } from '../utils/observable-instance-mapper';
import { Draft } from './draft';
import { PlayerStatus } from './player';

@Injectable({
  providedIn: 'root',
})
export class DraftService {
  public static readonly DRAFTS_URL: string = `${environment.apiUrl}/drafts`;
  private readonly drafts$: ReplaySubject<Draft[]> = new ReplaySubject(1);
  private readonly selectedDraft$: ReplaySubject<Draft | null> = new ReplaySubject(1);

  constructor(
    private http: HttpClient,
    private dbService: NgxIndexedDBService,
  ) {}

  init(): Observable<void> {
    return this.loadAll().pipe(
      take(1),
      tap((drafts) => {
        this.drafts$.next(drafts);
        const localStoredSelectedDraftId = localStorage.getItem('selectedDraftId');
        const matchingDraft = drafts.find((draft: Draft) => draft.id === localStoredSelectedDraftId);
        if (matchingDraft) {
          this.selectedDraft$.next(matchingDraft);
        }
      }),
      switchMap(() => this.refreshAll()),
      map(() => undefined),
    );
  }

  getDrafts$(): Observable<Draft[]> {
    return this.drafts$.asObservable();
  }

  getSelectedDraft$(): Observable<Draft | null> {
    return this.selectedDraft$.asObservable();
  }

  selectDraft(draftId: string) {
    return this.drafts$
      .pipe(
        take(1),
        map((drafts) => drafts.find((draft) => draft.id === draftId)),
        filter(Boolean),
        tap((draft) => {
          this.selectedDraft$.next(draft);
          localStorage.setItem('selectedDraftId', draft.id);
        }),
      )
      .subscribe();
  }

  createDraft(properties: Record<string, string>) {
    return this.http
      .post<Draft>(DraftService.DRAFTS_URL, properties)
      .pipe(
        take(1),
        switchMap(() => this.refreshAll()),
      )
      .subscribe();
  }

  updatePosition(draftPosition: string) {
    const body = { draftPosition };
    return this.callUpdate(body);
  }

  updateThirdRoundReversal(thirdRoundReversal: boolean) {
    const body = { thirdRoundReversal };
    return this.callUpdate(body);
  }

  updatePlayerStatus(id: string, playerStatus: PlayerStatus) {
    if (!this.selectedDraft$) {
      return;
    }
    const body = { playerStates: { [id]: playerStatus } };
    return this.callUpdate(body);
  }

  undo() {
    if (!this.selectedDraft$) {
      return;
    }
    return this.callUndo();
  }

  reset(id: string) {
    return this.http.put<Draft>(`${DraftService.DRAFTS_URL}/${id}/reset`, {}).pipe(
      switchMap(() => this.http.get<Draft[]>(DraftService.DRAFTS_URL)),
      switchMap((drafts) => of(plainToInstance(Draft, drafts))),
      tap((drafts) => {
        this.drafts$.next(drafts);
      }),
    );
  }

  delete(id: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.delete(`${DraftService.DRAFTS_URL}/${id}`, { headers });
  }

  refreshAll() {
    return this.loadDraftsFromApi().pipe(
      take(1),
      tap((drafts) => this.drafts$.next(drafts)),
      switchMap((drafts) =>
        this.clearAll().pipe(
          map(() => drafts),
          switchMap((drafts) => this.storeDraftsInDB(drafts)),
        ),
      ),
    );
  }

  private loadAll(): Observable<Draft[]> {
    return this.dbService
      .count(STORE_NAME_DRAFTS)
      .pipe(switchMap((count: number) => (count > 0 ? this.loadDraftsFromDB() : of([]))));
  }

  private loadDraftsFromApi(): Observable<Draft[]> {
    return this.http.get<Draft[]>(DraftService.DRAFTS_URL).pipe(map((drafts) => plainToInstance(Draft, drafts)));
  }

  private loadDraftsFromDB(): Observable<Draft[]> {
    return ObservableInstanceMapper.valuesToInstance(this.dbService.getAll<Draft>(STORE_NAME_DRAFTS), Draft);
  }

  private storeDraftsInDB(drafts: Draft[]): Observable<number[]> {
    return this.dbService.bulkAdd(STORE_NAME_DRAFTS, drafts);
  }

  private clearAll(): Observable<boolean> {
    return this.dbService.clear(STORE_NAME_DRAFTS);
  }

  private callUpdate(body: {}) {
    return this.selectedDraft$
      .pipe(
        take(1),
        filter(Boolean),
        switchMap((selectedDraft) =>
          this.http.put<Draft>(`${DraftService.DRAFTS_URL}/${selectedDraft.id}`, body).pipe(map(() => selectedDraft)),
        ),
        switchMap((selectedDraft) => this.refreshAll().pipe(map(() => selectedDraft))),
        switchMap((selectedDraft) =>
          this.drafts$.pipe(
            take(1),
            map((drafts) => ({ drafts, selectedDraft })),
          ),
        ),
        tap(({ drafts, selectedDraft }) => {
          const updatedDraft = drafts.find((draft) => draft.id === selectedDraft.id);
          this.selectedDraft$.next(updatedDraft || null);
        }),
      )
      .subscribe();
  }

  private callUndo() {
    return this.selectedDraft$
      .pipe(
        take(1),
        filter(Boolean),
        switchMap((selectedDraft) =>
          this.http.post<Draft>(`${DraftService.DRAFTS_URL}/${selectedDraft.id}/undo`, {}).pipe(map(() => selectedDraft)),
        ),
        switchMap((selectedDraft) => this.refreshAll().pipe(map(() => selectedDraft))),
        switchMap((selectedDraft) =>
          this.drafts$.pipe(
            take(1),
            map((drafts) => ({ drafts, selectedDraft })),
          ),
        ),
        tap(({ drafts, selectedDraft }) => {
          const updatedDraft = drafts.find((draft) => draft.id === selectedDraft.id);
          this.selectedDraft$.next(updatedDraft || null);
        }),
      )
      .subscribe();
  }
}
