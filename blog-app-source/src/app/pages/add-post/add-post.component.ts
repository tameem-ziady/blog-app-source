import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PostFormComponent, NewPostPayload } from '../../components/post-form/post-form.component';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-add-post',
  standalone: true,
  imports: [PostFormComponent],
  templateUrl: './add-post.component.html',
  styleUrl: './add-post.component.css',
})
export class AddPostComponent implements OnInit, OnDestroy {
  private blogService = inject(BlogService);
  private router = inject(Router);

  justAddedTitle = signal<string | null>(null);

  ngOnInit(): void {
    // A user can land here directly (deep link, refresh, typed URL) before
    // any other page has populated the posts signal. addPostLocally() derives
    // its new id from the current posts list, so that list must be loaded
    // first, or a locally-generated id can collide with a real post id that
    // hasn't been fetched yet.
    if (!this.blogService.loaded()) {
      this.blogService.fetchPosts().subscribe();
    }
  }

  // Handles the @Output() emitted by PostFormComponent
  onPostAdded(payload: NewPostPayload): void {
    const newPost = this.blogService.addPostLocally(payload.title, payload.body);
    this.justAddedTitle.set(newPost.title);

    // Briefly show a confirmation, then send the user to the new post.
    setTimeout(() => {
      this.router.navigate(['/posts', newPost.id]);
    }, 900);
  }

  ngOnDestroy(): void {
    console.log('[AddPostComponent] destroyed');
  }
}
