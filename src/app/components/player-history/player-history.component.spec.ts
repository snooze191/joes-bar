import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerHistoryComponent } from './player-history.component';

describe('PlayerHistoryComponent', () => {
  let component: PlayerHistoryComponent;
  let fixture: ComponentFixture<PlayerHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
