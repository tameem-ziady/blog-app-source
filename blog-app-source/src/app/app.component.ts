import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  private router = inject(Router);

  // Manual "active link" tracking since routerLinkActive is off-limits.
  currentUrl = signal<string>(this.router.url);

  ngOnInit(): void {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.currentUrl.set((e as NavigationEnd).urlAfterRedirects);
      });
  }

  isActive(path: string): boolean {
    const url = this.currentUrl();
    if (path === '/') {
      return url === '/';
    }
    return url === path || url.startsWith(path + '/');
  }
}
