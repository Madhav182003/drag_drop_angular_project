import { Component, OnInit } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-drag-and-drop',
  templateUrl: './drag-and-drop.component.html',
  styleUrls: ['./drag-and-drop.component.css'],
  standalone: true,
  imports: [CommonModule, CdkDropListGroup, CdkDropList, CdkDrag, HttpClientModule],
})
export class DragAndDropComponent implements OnInit {
  todo: string[] = [];
  done: string[] = [];

  filteredTodo = [...this.todo];
  filteredDone = [...this.done];

  selectedItems = new Set<string>();
  lastSelectedIndex: number | null = null;
  isDragging = false;
  draggedItem: string | null = null;

  todoSearchQuery = '';
  doneSearchQuery = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadTodoList();
  }

  loadTodoList() {
    this.http.get('/assets/printPublication.txt', { responseType: 'text' }).subscribe(
      (data) => {
        const jsonData = JSON.parse(data).print;
        this.todo = jsonData.map((item: any) => `${item.name} - ${item.ediPlace}`);
        this.filteredTodo = [...this.todo];
      },
      (error) => {
        console.error('Error loading todo list:', error);
      }
    );
  }

  toggleSelection(event: MouseEvent, item: string, list: string[]) {
    const itemIndex = list.indexOf(item);

    if (event.shiftKey && this.lastSelectedIndex !== null) {
      const start = Math.min(this.lastSelectedIndex, itemIndex);
      const end = Math.max(this.lastSelectedIndex, itemIndex);
      const range = list.slice(start, end + 1);

      range.forEach((i) => this.selectedItems.add(i));
    } else if (event.ctrlKey || event.metaKey) {
      if (this.selectedItems.has(item)) {
        this.selectedItems.delete(item);
      } else {
        this.selectedItems.add(item);
      }
      this.lastSelectedIndex = itemIndex;
    } else if (event.shiftKey) {
      // Handle the case when Shift is pressed but there's no previous selection
      if (this.lastSelectedIndex === null) {
        this.selectedItems.add(item);
        this.lastSelectedIndex = itemIndex;
      }
    } else {
      // If no modifier key is pressed, toggle the selection of the clicked item
      if (this.selectedItems.size === 1 && this.selectedItems.has(item)) {
        this.selectedItems.delete(item);
        this.lastSelectedIndex = null;
      } else if (this.selectedItems.size === 0 || !this.selectedItems.has(item)) {
        this.selectedItems.clear();
        this.selectedItems.add(item);
        this.lastSelectedIndex = itemIndex;
      }
    }
  }

  trackByFn(index: number, item: string) {
    return item;
  }

  drop(event: CdkDragDrop<string[]>) {
    const selectedItems = Array.from(this.selectedItems);
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.lastSelectedIndex = null;
      this.selectedItems.clear();
    } else {
      if (selectedItems.length > 1) {
        selectedItems.forEach((item) => {
          const prevIndex = event.previousContainer.data.indexOf(item);
          if (prevIndex > -1) {
            event.previousContainer.data.splice(prevIndex, 1);
            event.container.data.splice(event.currentIndex, 0, item);
          }
          this.lastSelectedIndex = null;
        });
        this.selectedItems.clear();
      } else {
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
        this.lastSelectedIndex = null;
      }
    }
    this.updateFilteredLists();
  }

  shiftItems(fromList: string[], toList: string[]) {
    this.selectedItems.forEach((item) => {
      const index = fromList.indexOf(item);
      if (index > -1) {
        fromList.splice(index, 1);
        toList.push(item);
      }
    });
    this.selectedItems.clear();
    this.lastSelectedIndex = null;
    this.updateFilteredLists();
  }

  updateFilteredLists() {
    this.filteredTodo = this.todo.filter((item) =>
      item.toLowerCase().includes(this.todoSearchQuery.toLowerCase())
    );
    this.filteredDone = this.done.filter((item) =>
      item.toLowerCase().includes(this.doneSearchQuery.toLowerCase())
    );
  }

  searchTodoList(event: Event) {
    const target = event.target as HTMLInputElement;
    this.todoSearchQuery = target.value;
    this.updateFilteredLists();
  }

  searchDoneList(event: Event) {
    const target = event.target as HTMLInputElement;
    this.doneSearchQuery = target.value;
    this.updateFilteredLists();
  }

  onDragStarted(item: string) {
    this.isDragging = true;
    this.draggedItem = item;
    const selectedItems = Array.from(this.selectedItems);
    selectedItems.forEach((selectedItem) => {
      const itemElement = document.querySelector(`.example-box[data-item="${selectedItem}"]`);
      if (itemElement) {
        itemElement.classList.add('dragging');
      }
    });
    const draggedElement = document.querySelector(`.example-box[data-item="${item}"]`);
    if (draggedElement) {
      draggedElement.classList.add('dragging');
    }
  }

  onDragEnded(item: string) {
    this.isDragging = false;
    this.draggedItem = null;
    const selectedItems = Array.from(this.selectedItems);
    selectedItems.forEach((selectedItem) => {
      const itemElement = document.querySelector(`.example-box[data-item="${selectedItem}"]`);
      if (itemElement) {
        itemElement.classList.remove('dragging');
      }
    });
    const draggedElement = document.querySelector(`.example-box[data-item="${item}"]`);
    if (draggedElement) {
      draggedElement.classList.remove('dragging');
    }
  }
}
