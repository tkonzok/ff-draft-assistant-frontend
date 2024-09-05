import {Component, Input, OnInit} from "@angular/core";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {ScheduleService} from "../../../domain/schedule.service";
import {map, tap} from "rxjs";
import {Schedule} from "../../../domain/schedule";
import {NgForOf} from "@angular/common";

@Component({
  selector: "app-schedule",
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: "./schedule.component.html",
  styleUrls: ["./schedule.component.css"],
})
export class ScheduleComponent implements OnInit {
  protected fullSchedule: Schedule[] = [];
  protected filteredSchedule: Schedule[] = [];
  private _week?: number;

  @Input() set week(value: number) {
    this._week = value
    this.filterSchedule()
  }

  get week(): number | undefined {
    return this._week;
  }

  constructor(
    private scheduleService: ScheduleService,
  ) {}

  ngOnInit() {
    this.scheduleService.getSchedule().pipe(
      tap((schedule) => {
        this.fullSchedule = schedule
        this.filterSchedule()
      })
    ).subscribe()
  }

  private filterSchedule() {
    this.filteredSchedule = this.fullSchedule.filter((game) => game.week === this.week)
  }
}
