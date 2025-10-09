import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DropdownLanguage} from './dropdown-language';

describe('DropdownLanguage', () => {
  let component: DropdownLanguage;
  let fixture: ComponentFixture<DropdownLanguage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownLanguage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DropdownLanguage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
