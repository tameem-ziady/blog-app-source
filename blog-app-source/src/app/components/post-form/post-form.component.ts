import { Component, EventEmitter, OnDestroy, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

export interface NewPostPayload {
  title: string;
  body: string;
}

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './post-form.component.html',
  styleUrl: './post-form.component.css',
})
export class PostFormComponent implements OnDestroy {
  private fb = inject(FormBuilder);

  // Requirement 6: emits the new post up to the parent (AddPostComponent)
  @Output() postAdded = new EventEmitter<NewPostPayload>();

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    body: ['', [Validators.required, Validators.minLength(20)]],
  });

  get titleControl() {
    return this.form.controls.title;
  }

  get bodyControl() {
    return this.form.controls.body;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, body } = this.form.getRawValue();
    this.postAdded.emit({ title: title.trim(), body: body.trim() });
    this.form.reset();
  }

  ngOnDestroy(): void {
    console.log('[PostFormComponent] destroyed');
  }
}
