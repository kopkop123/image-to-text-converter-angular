import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageUploaderComponent } from './image-uploader.component';

describe('ImageUploader', () => {
  let component: ImageUploaderComponent;
  let fixture: ComponentFixture<ImageUploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageUploaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageUploaderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
