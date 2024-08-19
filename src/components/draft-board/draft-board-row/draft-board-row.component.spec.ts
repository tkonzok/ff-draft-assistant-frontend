import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DraftBoardRowComponent } from "./draft-board-row.component";

describe("PlayerRowComponent", () => {
  let component: DraftBoardRowComponent;
  let fixture: ComponentFixture<DraftBoardRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DraftBoardRowComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DraftBoardRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
