import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../services/blog.service';
import { Post } from '../../models/post.model';

const LONG_POST_THRESHOLD = 150; // characters in body

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.css',
})
export class PostsComponent implements OnInit, OnDestroy {
  blogService = inject(BlogService);

  // Local UI state as signals
  searchTerm = signal<string>('');
  selectedUserId = signal<number | null>(null);

  posts = this.blogService.posts;
  users = this.blogService.users;
  loading = this.blogService.loading;

  // Requirement 11: computed signal for total posts *after* filtering
  filteredPosts = computed<Post[]>(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const userId = this.selectedUserId();

    return this.posts().filter((post) => {
      const matchesTerm = term ? post.title.toLowerCase().includes(term) : true;
      const matchesUser = userId != null ? post.userId === userId : true;
      return matchesTerm && matchesUser;
    });
  });

  totalFilteredCount = computed(() => this.filteredPosts().length);

  ngOnInit(): void {
    this.loadPosts();
    if (this.blogService.users().length === 0) {
      this.blogService.fetchUsers().subscribe();
    }
  }

  ngOnDestroy(): void {
    console.log('[PostsComponent] destroyed');
  }

  // Requirement 8: Event binding - Load posts
  loadPosts(): void {
    this.blogService.fetchPosts().subscribe();
  }

  // Requirement 8: Event binding - Delete post (locally)
  onDelete(id: number, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.blogService.deletePost(id);
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  onUserFilterChange(value: string): void {
    this.selectedUserId.set(value ? Number(value) : null);
  }

  isLongPost(post: Post): boolean {
    return post.body.length > LONG_POST_THRESHOLD;
  }

  shortBody(body: string, max = 110): string {
    return body.length > max ? body.slice(0, max).trim() + '…' : body;
  }

  userName(userId: number): string | undefined {
    return this.blogService.getUserById(userId)?.name;
  }
}
