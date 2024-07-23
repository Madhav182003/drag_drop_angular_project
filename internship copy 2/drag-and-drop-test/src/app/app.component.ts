import { Component } from '@angular/core';
import { DragAndDropComponent } from './drag-and-drop/drag-and-drop.component';

@Component({
  selector: 'app-root',
  template: '<app-drag-and-drop></app-drag-and-drop>',
  standalone: true,
  imports: [DragAndDropComponent]
})
export class AppComponent {}
