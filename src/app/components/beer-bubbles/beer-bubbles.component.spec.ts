import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeerBubblesComponent } from './beer-bubbles.component';

describe('BeerBubblesComponent', () => {
  let component: BeerBubblesComponent;
  let fixture: ComponentFixture<BeerBubblesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeerBubblesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeerBubblesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
