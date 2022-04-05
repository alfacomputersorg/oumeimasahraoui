import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShouldLoginPanelComponent } from './should-login-panel.component';

describe('ShouldLoginPanelComponent', () => {
  let component: ShouldLoginPanelComponent;
  let fixture: ComponentFixture<ShouldLoginPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShouldLoginPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShouldLoginPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
