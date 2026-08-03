import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { Post } from '../models/post.model';
import { User } from '../models/user.model';
import { Comment } from '../models/comment.model';

const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts';
const USERS_URL = 'https://jsonplaceholder.typicode.com/users';
const COMMENTS_URL = 'https://jsonplaceholder.typicode.com/comments';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private http = inject(HttpClient);

  // ---- Signals: source of truth for posts once loaded ----
  private postsSignal = signal<Post[]>([]);
  private usersSignal = signal<User[]>([]);
  private loadingSignal = signal<boolean>(false);
  private loadedSignal = signal<boolean>(false);

  readonly posts = this.postsSignal.asReadonly();
  readonly users = this.usersSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly loaded = this.loadedSignal.asReadonly();

  // Requirement 11: signal tracking total number of posts
  readonly totalPosts = computed(() => this.postsSignal().length);

  // Fetch posts from the API and populate the signal.
  fetchPosts(): Observable<Post[]> {
    this.loadingSignal.set(true);
    return this.http.get<Post[]>(POSTS_URL).pipe(
      tap((posts) => {
        this.postsSignal.set(posts);
        this.loadingSignal.set(false);
        this.loadedSignal.set(true);
      }),
      catchError((err) => {
        this.loadingSignal.set(false);
        this.loadedSignal.set(true);
        console.error('Failed to fetch posts', err);
        return of([]);
      })
    );
  }

  fetchUsers(): Observable<User[]> {
    return this.http.get<User[]>(USERS_URL).pipe(
      tap((users) => this.usersSignal.set(users)),
      catchError((err) => {
        console.error('Failed to fetch users', err);
        return of([]);
      })
    );
  }

  fetchComments(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${COMMENTS_URL}?postId=${postId}`).pipe(
      catchError((err) => {
        console.error('Failed to fetch comments', err);
        return of([]);
      })
    );
  }

  getPostById(id: number): Post | undefined {
    return this.postsSignal().find((p) => p.id === id);
  }

  getUserById(id: number): User | undefined {
    return this.usersSignal().find((u) => u.id === id);
  }

  // Requirement 5/8: Add a post locally after form submission.
  // JSONPlaceholder's POST endpoint is a fake echo (it doesn't persist),
  // so the new post is generated with a local id and unshifted into the signal.
  addPostLocally(title: string, body: string, userId: number = 1): Post {
    const existingIds = this.postsSignal().map((p) => p.id);
    const nextId = existingIds.length ? Math.max(...existingIds) + 1 : 1;
    const newPost: Post = { id: nextId, userId, title, body };
    this.postsSignal.update((posts) => [newPost, ...posts]);
    return newPost;
  }

  // Requirement 8: Delete Post (locally)
  deletePost(id: number): void {
    this.postsSignal.update((posts) => posts.filter((p) => p.id !== id));
  }
}
