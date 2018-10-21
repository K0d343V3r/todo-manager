import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { TodoListItem } from '../proxies/todo-api-proxies';
import { DueDateOption, DueDateService } from '../services/due-date.service'
import { MatDialog, MatDialogConfig, MatTable } from "@angular/material";
import { TodoItemDialogComponent, TodoItemDialogData } from '../todo-item-dialog/todo-item-dialog.component';
import { TodoListService } from "../services/todo-list.service";

@Component({
  selector: 'app-todo-item-table',
  templateUrl: './todo-item-table.component.html',
  styleUrls: ['./todo-item-table.component.css']
})
export class TodoItemTableComponent {
  private _selectedItemIndex: number = -1;
  @ViewChild(MatTable) private itemTable: MatTable<any>;

  constructor(
    private dueDateService: DueDateService,
    private todoListService: TodoListService,
    private dialog: MatDialog
  ) { }

  /** Fires when the index of the currently selected item changes. */
  @Output() selectedIndexChanged = new EventEmitter<number>();

  /** Fires when an item was edited. */
  @Output() selectedItemEdited = new EventEmitter<TodoListItem>();

  /** Returns the index of the currently selected item. */
  get selectedItemIndex(): number {
    return this._selectedItemIndex;
  }

  /** Returns the number of items in the table. */
  get count(): number {
    return this.viewItems.length;
  }

  /** Returns the item at the requested position. */
  getItemAt(index: number): TodoListItem {
    if (index >= 0 && index < this.viewItems.length) {
      // return a copy of the item
      return this.viewItems[this._selectedItemIndex].clone();
    }

    return null;
  }

  /** Adds new item to the table. */
  addItem(item: TodoListItem): void {
    this.adjustInsertionIndex(item);
    this.viewItems.splice(item.position, 0, item);
    this.itemTable.renderRows();
    this.changeSelectedIndex(item.position);

    this.todoListService.fireItemAdded(item);
  }

  private adjustInsertionIndex(item: TodoListItem) {
    if (item.position < 0) {
      item.position = 0;
    } else if (item.position > this.viewItems.length) {
      item.position = this.viewItems.length;
    }
  }

  /** Clears the table and adds multiple items. */
  addItems(items: TodoListItem[]): void {
    if (items.length == 0) {
      this.viewItems = [];
      this.changeSelectedIndex(-1);
    } else {
      const id = this.selectedItemIndex < 0 ? 0 : this.viewItems[this.selectedItemIndex].id;
      this.viewItems.splice(0, this.viewItems.length, ...items);
      if (id == 0) {
        this.changeSelectedIndex(0);
      } else {
        const index = this.viewItems.findIndex(item => item.id == id);
        if (index >= 0) {
          this.changeSelectedIndex(index);
        } else {
          this.changeSelectedIndex(0);
        }
      }
      this.itemTable.renderRows();
    }
  }

  /** Deletes the currently selected item. */
  removeSelected(): number {
    if (this.selectedItemIndex >= 0) {
      const removedItems = this.viewItems.splice(this.selectedItemIndex, 1);
      if (this.selectedItemIndex == this.viewItems.length) {
        this.changeSelectedIndex(this.selectedItemIndex - 1);
      }
      this.itemTable.renderRows();

      this.todoListService.fireItemRemoved(removedItems[0]);
      return removedItems[0].id;
    }

    return 0;
  }

  /** Moves the selected item up or down in the table. */
  moveSelected(up: boolean): number {
    if (this.canMove(up)) {
      const itemsToMove = this.viewItems.splice(this.selectedItemIndex, 1);
      const position = up ? this.selectedItemIndex - 1 : this.selectedItemIndex + 1;
      this.viewItems.splice(position, 0, itemsToMove[0]);
      this.changeSelectedIndex(position);
      this.itemTable.renderRows();
      return position;
    }

    return -1;
  }

  canMove(up: boolean): boolean {
    return (up && this.selectedItemIndex > 0) || (!up && this.selectedItemIndex < this.viewItems.length - 1);
  }

  /** View Api */

  viewItems: TodoListItem[] = [];
  viewColumns: string[] = ['done', 'task', 'dueDate', 'edit'];

  viewItemChecked(event): void {
    const oldItem = this.viewItems[this.selectedItemIndex].clone();
    const newItem = this.viewItems[this.selectedItemIndex];
    newItem.done = event.checked;

    this.todoListService.fireItemEdited({oldItem: oldItem, newItem: newItem});
    this.selectedItemEdited.emit(newItem);
  }

  viewGetDueString(date: Date): string {
    const option = this.dueDateService.dateToEnum(date);
    if (option == DueDateOption.None) {
      return "";
    } else {
      return this.dueDateService.toString(option, date);
    }
  }

  viewEditItem(index: number): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = new TodoItemDialogData(this.viewItems[index].task, this.viewItems[index].dueDate);
    const dialogRef = this.dialog.open(TodoItemDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(data => { if (data != null) this.editItem(data); });
  }

  private editItem(data: TodoItemDialogData): void {
    const oldItem = this.viewItems[this.selectedItemIndex].clone();
    const newItem = this.viewItems[this.selectedItemIndex];
    newItem.task = data.task;
    newItem.dueDate = data.dueDate;

    this.todoListService.fireItemEdited({oldItem: oldItem, newItem: newItem});
    this.selectedItemEdited.emit(newItem);
  }

  viewRowSelected(index: number) {
    this.changeSelectedIndex(index);
  }

  private changeSelectedIndex(index: number) {
    if (this._selectedItemIndex != index) {
      this._selectedItemIndex = index;
      this.selectedIndexChanged.emit(index);
    }
  }
}
