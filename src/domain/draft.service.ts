import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { plainToInstance } from "class-transformer";
import { BehaviorSubject, of, switchMap, tap } from "rxjs";
import { Draft } from "./draft";
import {PlayerStatus} from "./player";

@Injectable({
  providedIn: "root",
})
export class DraftService {
  public static readonly DRAFTS_URL: string = "http://localhost:3000/api/drafts";
  private draftsSubject = new BehaviorSubject<Draft[]>([]);
  drafts$ = this.draftsSubject.asObservable();
  private selectedDraftSubject = new BehaviorSubject<Draft | null>(null);
  selectedDraft$ = this.selectedDraftSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadDrafts();
  }

  selectDraft(draftId: string) {
    const draft = this.draftsSubject.getValue().find((draft) => draft.id === draftId);
    if (!draft) {
      return;
    }
    this.selectedDraftSubject.next(draft);
  }

  createDraft(properties: Record<string, string>) {
    return this.http
      .post<Draft>(DraftService.DRAFTS_URL, properties)
      .pipe(
        switchMap(() => this.http.get<Draft[]>(DraftService.DRAFTS_URL)),
        switchMap((drafts) => of(plainToInstance(Draft, drafts))),
        tap((drafts) => {
          this.draftsSubject.next(drafts); // Update drafts
          console.log("Draft created and drafts refreshed:", drafts);
        }),
      )
      .subscribe();
  }

  updatePosition(id: string, draftPosition: string) {
    const body = { draftPosition };
    return this.callUpdate(id, body);
  }

  updatePlayerStatus(id: string, playerStatus: PlayerStatus) {
    if (!this.selectedDraftSubject) {
      return;
    }
    const body = { playerStates: { [id]: playerStatus } };
    return this.callUpdate(this.selectedDraftSubject.getValue()!.id, body)
  }

  reset(id: string) {
    const params = new HttpParams().set("reset", true);
    return this.http
      .post<Draft>(`${DraftService.DRAFTS_URL}/${id}`, {}, { params })
      .pipe(
        switchMap(() => this.http.get<Draft[]>(DraftService.DRAFTS_URL)),
        switchMap((drafts) => of(plainToInstance(Draft, drafts))),
        tap((drafts) => {
          this.draftsSubject.next(drafts);
          console.log(`Draft ${id} updated and drafts refreshed:`, drafts);
        }),
      )
      .subscribe();
  }

  delete(id: string) {
    return this.http.delete(`${DraftService.DRAFTS_URL}/${id}`).subscribe();
  }

  private loadDrafts() {
    this.http
      .get<Draft[]>(DraftService.DRAFTS_URL)
      .pipe(
        switchMap((drafts) => of(plainToInstance(Draft, drafts))),
        tap((drafts) => this.draftsSubject.next(drafts)),
      )
      .subscribe();
  }

  private callUpdate(id: string, body: {}) {
    return this.http
      .put<Draft>(`${DraftService.DRAFTS_URL}/${id}`, body)
      .pipe(
        switchMap(() => this.http.get<Draft[]>(DraftService.DRAFTS_URL)),
        switchMap((drafts) => of(plainToInstance(Draft, drafts))),
        tap((drafts) => {
          const selectedDraftId = this.selectedDraftSubject.getValue()?.id
          this.draftsSubject.next(drafts);
          if (!selectedDraftId) {
            return
          }
          const selectedDraft = this.draftsSubject.getValue().find((draft) => draft.id === selectedDraftId)
          if (!selectedDraft) {
            return;
          }
          this.selectedDraftSubject.next(selectedDraft)
        }),
      )
      .subscribe();
  }
}
