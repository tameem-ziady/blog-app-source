import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  blogService = inject(BlogService);

  ngOnInit(): void {
    // Warm the posts signal so the "total posts" stat is ready
    // by the time the user reaches the Posts page.
    if (!this.blogService.loaded()) {
      this.blogService.fetchPosts().subscribe();
    }
  }

  ngOnDestroy(): void {
    console.log('[HomeComponent] destroyed');
  }
}
