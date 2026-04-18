import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-success-banner',
  imports: [],
  templateUrl: './success-banner.html',
  styleUrl: './success-banner.css',
})
export class SuccessBanner {
  @Input() title: string = 'Successful!';
  @Input({ required: true }) message!: string;

}
