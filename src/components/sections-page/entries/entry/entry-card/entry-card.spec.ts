import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntryCard } from './entry-card';

describe('EntryCard', () => {
  let component: EntryCard;
  let fixture: ComponentFixture<EntryCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntryCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntryCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
