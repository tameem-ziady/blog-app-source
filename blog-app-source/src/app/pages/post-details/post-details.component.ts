import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { Post } from '../../models/post.model';
import { User } from '../../models/user.model';
import { Comment } from '../../models/comment.model';

@Component({
  selector: 'app-post-details',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './post-details.component.html',
  styleUrl: './post-details.component.css',
})
export class PostDetailsComponent implements OnInit, OnChanges, OnDestroy {
  private blogService = inject(BlogService);

  // Bound automatically from the :id route param via withComponentInputBinding()
  @Input() id!: string;

  // Requirement 11: selected post stored in a signal
  selectedPost = signal<Post | undefined>(undefined);
  author = signal<User | undefined>(undefined);
  comments = signal<Comment[]>([]);
  commentsLoading = signal<boolean>(false);
  notFound = signal<boolean>(false);

  ngOnInit(): void {
    // Ensure posts/users are available if the user lands here directly (deep link)
    if (!this.blogService.loaded()) {
      this.blogService.fetchPosts().subscribe(() => this.resolvePost());
    } else {
      this.resolvePost();
    }
    if (this.blogService.users().length === 0) {
      this.blogService.fetchUsers().subscribe(() => this.resolveAuthor());
    }
  }

  // Requirement 10: ngOnChanges in a component receiving @Input()
  // Fires again whenever the router swaps :id (e.g. navigating from
  // one post's detail page directly to another's via a link).
  // resolvePost() internally handles both the post lookup and comment
  // fetch, so it's the single source of truth for "id changed" work -
  // calling loadComments() separately here would double-fetch on init,
  // since ngOnChanges also fires (with firstChange=true) before ngOnInit.
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id'] && !changes['id'].firstChange) {
      this.resolvePost();
    }
  }

  ngOnDestroy(): void {
    console.log(`[PostDetailsComponent] destroyed (post id was ${this.id})`);
  }

  private resolvePost(): void {
    const numericId = Number(this.id);
    const post = this.blogService.getPostById(numericId);
    this.selectedPost.set(post);
    this.notFound.set(!post);
    this.resolveAuthor();
    this.loadComments();
  }

  private resolveAuthor(): void {
    const post = this.selectedPost();
    if (post) {
      this.author.set(this.blogService.getUserById(post.userId));
    }
  }

  // Bonus (12): comments for this post
  private loadComments(): void {
    const numericId = Number(this.id);
    if (!numericId) return;
    this.commentsLoading.set(true);
    this.blogService.fetchComments(numericId).subscribe((comments) => {
      this.comments.set(comments);
      this.commentsLoading.set(false);
    });
  }
}
