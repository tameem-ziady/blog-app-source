# Blog Application — Angular 21 Standalone Components

A blog app built with Angular Standalone Components (no NgModules) and the
JSONPlaceholder REST API.

## Setup

```bash
npm install
npm start
```

Then open http://localhost:4200. (`ng build` also works for a production
bundle; output goes to `dist/blog-app`.)

Requires Node 20+ and Angular CLI 21 (installed automatically as a
devDependency, so `npx ng` works without a global install).

## Project structure

```
src/app/
  app.component.ts          Root shell: nav bar with manual active-link logic
  app.config.ts              provideRouter(), provideHttpClient()
  app.routes.ts               Route table (lazy-loaded standalone pages)
  models/                     Post, User, Comment interfaces
  services/blog.service.ts    All HTTP calls + local post state (signals)
  components/post-form/       Reusable reactive form, emits via @Output()
  pages/
    home/                     Landing page, shows total-posts signal
    posts/                    List + search + user filter + delete
    post-details/             Single post, author, comments (bonus)
    add-post/                 Hosts PostFormComponent, handles the @Output()
    about/
    not-found/                Wildcard (**) route
```

## Requirement -> implementation notes

1. **Routing** — `app.routes.ts`, wired via `provideRouter()` in
   `app.config.ts`. `routerLinkActive` is intentionally not used anywhere;
   nav-link highlighting in `app.component.ts` is done manually by
   subscribing to `Router` events into a signal and comparing the current
   URL. Note the route order: `posts/add` is declared *before* `posts/:id`,
   otherwise the router would swallow `/posts/add` as `:id = "add"`.

2. **HttpClient / BlogService** — `services/blog.service.ts` centralizes
   every API call (`/posts`, `/users`, `/comments?postId=`) and all local
   mutations (add/delete). No component talks to `HttpClient` directly.

3. **Posts Page** — `pages/posts/`. Cards show title + a truncated body.

4. **Post Details** — `pages/post-details/`. The `:id` param binds straight
   to an `@Input() id` via `withComponentInputBinding()` (set in
   `app.config.ts`), which is what makes `ngOnChanges` fire correctly when
   navigating from one post's detail page to another's. Author is looked up
   from the same `BlogService` and displayed if found.

5. **Reactive Forms** — `components/post-form/`. `Validators.required` +
   `Validators.minLength(5)` on title, `minLength(20)` on body. Submit is
   disabled while invalid; inline errors show once a field is touched.

6. **@Output()** — `PostFormComponent` emits `postAdded` (typed as
   `NewPostPayload`); `AddPostComponent` listens with
   `(postAdded)="onPostAdded($event)"`.

7. **Services** — all data operations (fetch, add, delete, lookups) live in
   `BlogService`; components only call into it.

8. **Event Binding** — Load (`(click)="loadPosts()"` / auto on init), Add
   (form submit), Delete (`(click)="onDelete(...)"`), View Details
   (`routerLink` on each card).

9. **Conditional Rendering & Styling** — `@if` empty-state block shows
   "No Posts Found" when the filtered list is empty. Long posts (body >150
   chars) get a "Long read" badge vs. "Quick read" for short ones. The post
   grid fades/slides in once loading completes (`.loaded` class + CSS
   animation).

10. **Lifecycle Hooks** — `ngOnInit()` loads posts/users in Home, Posts, and
    Post Details. `ngOnChanges()` in `PostDetailsComponent` re-resolves the
    post/author/comments when the `:id` input changes (guarded against
    `firstChange` so it doesn't duplicate the work `ngOnInit` already did).
    Every component logs `ngOnDestroy()`.

11. **Signals** — `BlogService` holds `posts`, `users`, `loading`, `loaded`
    as signals, plus a `computed` `totalPosts`. `PostsComponent` layers its
    own `searchTerm`/`selectedUserId` signals and a `computed`
    `filteredPosts` (and `totalFilteredCount`) on top for the filtered
    total. `PostDetailsComponent` stores the selected post in a signal.

12. **Bonus** — Search-by-title and filter-by-user are both signal-driven
    in `PostsComponent`. Post Details fetches and displays comments from
    `/comments?postId={id}`.

## Known limitation

New posts are added **locally only** — JSONPlaceholder's `POST /posts`
endpoint is a fake echo that doesn't persist, so `BlogService` generates the
new post's id from the current in-memory list instead of trusting the API
response. This means `BlogService` must have already fetched the real posts
list before a new one is added, or the generated id could collide with a
real post id that hasn't loaded yet. `AddPostComponent` accounts for this in
`ngOnInit()` by fetching posts if they aren't already loaded, so this works
correctly even if a user deep-links straight to `/posts/add`.
