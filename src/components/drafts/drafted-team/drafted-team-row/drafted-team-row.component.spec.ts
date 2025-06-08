import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraftedTeamRowComponent } from './drafted-team-row.component';

describe('PlayerRowComponent', () => {
  let component: DraftedTeamRowComponent;
  let fixture: ComponentFixture<DraftedTeamRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DraftedTeamRowComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DraftedTeamRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
