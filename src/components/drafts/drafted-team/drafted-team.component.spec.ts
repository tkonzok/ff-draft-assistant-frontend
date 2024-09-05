import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DraftedTeamComponent } from "./drafted-team.component";

describe("TableComponent", () => {
  let component: DraftedTeamComponent;
  let fixture: ComponentFixture<DraftedTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DraftedTeamComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DraftedTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
