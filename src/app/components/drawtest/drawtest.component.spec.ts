import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawtestComponent } from './drawtest.component';

describe('DrawtestComponent', () => {
  let component: DrawtestComponent;
  let fixture: ComponentFixture<DrawtestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DrawtestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawtestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
