import { Component, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent implements OnDestroy {
  ngOnDestroy(): void {
    console.log('[AboutComponent] destroyed');
  }
}
