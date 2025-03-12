import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransaccionesFormComponent } from './transacciones-form.component';

describe('TransaccionesFormComponent', () => {
  let component: TransaccionesFormComponent;
  let fixture: ComponentFixture<TransaccionesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransaccionesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransaccionesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
