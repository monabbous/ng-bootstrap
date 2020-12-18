import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedSelectComponent } from './advanced-select.component';

describe('SmartSelectComponent', () => {
  let component: AdvancedSelectComponent;
  let fixture: ComponentFixture<AdvancedSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdvancedSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancedSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
