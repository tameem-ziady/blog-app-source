import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
    title: 'Home | BlogApp',
  },
  {
    path: 'posts',
    loadComponent: () =>
      import('./pages/posts/posts.component').then((m) => m.PostsComponent),
    title: 'Posts | BlogApp',
  },
  {
    path: 'posts/add',
    loadComponent: () =>
      import('./pages/add-post/add-post.component').then(
        (m) => m.AddPostComponent
      ),
    title: 'Add Post | BlogApp',
  },
  {
    path: 'posts/:id',
    loadComponent: () =>
      import('./pages/post-details/post-details.component').then(
        (m) => m.PostDetailsComponent
      ),
    title: 'Post Details | BlogApp',
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then((m) => m.AboutComponent),
    title: 'About | BlogApp',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
    title: 'Not Found | BlogApp',
  },
];
