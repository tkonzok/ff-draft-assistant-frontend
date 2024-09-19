import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {ScheduleService} from "../../../domain/schedule.service";
import {map, tap} from "rxjs";
import {Schedule} from "../../../domain/schedule";
import {NgClass, NgForOf} from "@angular/common";

@Component({
  selector: "app-schedule",
  standalone: true,
  imports: [
    NgForOf,
    NgClass
  ],
  templateUrl: "./schedule.component.html",
  styleUrls: ["./schedule.component.css"],
})
export class ScheduleComponent implements OnInit {
  protected fullSchedule: Schedule[] = [];
  protected filteredSchedule: Schedule[] = [];
  protected filteredScheduleMapByDate: [string, Schedule[]][] = [];
  private _week?: number;

  @Input() set week(value: number) {
    this._week = value
    this.filterSchedule()
    this.sortSchedule()
    this.mapScheduleDates();
  }

  get week(): number | undefined {
    return this._week;
  }

  @Input() selectedGame?: Schedule;

  @Output() selectGame: EventEmitter<Schedule> = new EventEmitter<Schedule>()

  constructor(
    private scheduleService: ScheduleService,
  ) {}

  ngOnInit() {
    this.scheduleService.getSchedule().pipe(
      tap((schedule) => {
        this.fullSchedule = schedule
        this.filterSchedule();
        this.sortSchedule();
        this.mapScheduleDates();
      })
    ).subscribe()
  }

  protected onSelectGame(game: Schedule) {
    this.selectGame.emit(game)
  }

  private filterSchedule() {
    this.filteredSchedule = this.fullSchedule.filter((game) => game.week === this.week)
  }

  private sortSchedule() {
    this.filteredSchedule = this.filteredSchedule.sort((a, b) => a.date.localeCompare(b.date))
  }

  private mapScheduleDates() {
    const map = this.filteredSchedule.reduce((map, schedule) => {
      const date = schedule.date;
      if (!map.has(date)) {
        map.set(date, []);
      }
      map.get(date)?.push(schedule);
      return map;
    }, new Map<string, Schedule[]>());
    this.filteredScheduleMapByDate = Array.from(map.entries())
  }
}
