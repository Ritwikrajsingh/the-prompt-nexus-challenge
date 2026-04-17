import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-banner',
  imports: [],
  templateUrl: './error-banner.html',
  styleUrl: './error-banner.css',
})
export class ErrorBanner {
  @Input() title: string = 'Error';
  @Input({ required: true }) message!: string;
}
