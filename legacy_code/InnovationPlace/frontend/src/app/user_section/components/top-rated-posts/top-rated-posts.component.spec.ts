import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopRatedPostsComponent } from './top-rated-posts.component';

describe('TopRatedPostsComponent', () => {
  let component: TopRatedPostsComponent;
  let fixture: ComponentFixture<TopRatedPostsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopRatedPostsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopRatedPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
