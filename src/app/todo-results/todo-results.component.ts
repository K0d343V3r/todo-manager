import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TodoQuery, TodoQueriesProxy, TodoQueryResults, TodoListItem, QueryOperand, ITodoListItem, TodoItemsProxy, TodoItemReference, TodoReferencesProxy } from '../proxies/todo-api-proxies';
import { TodoItemTableComponent } from '../todo-item-table/todo-item-table.component';
import { TodoQueryService } from '../services/todo-query.service';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { TodoItemDialogComponent, TodoItemDialogData, TodoItemDialogDataValues } from '../todo-item-dialog/todo-item-dialog.component';
import { TodoListService, ItemEditedEventArgs } from "../services/todo-list.service";

@Component({
  selector: 'app-todo-results',
  templateUrl: './todo-results.component.html',
  styleUrls: ['./todo-results.component.css']
})
export class TodoResultsComponent implements OnInit {
  @ViewChild(TodoItemTableComponent) private itemTable: TodoItemTableComponent;
  private todoQuery: TodoQuery;
  private todoReferences: TodoItemReference[];
  todoQuery$: Observable<TodoQuery>;
  subTitle: string;

  constructor(
    private route: ActivatedRoute,
    private todoQueriesProxy: TodoQueriesProxy,
    private todoQueryService: TodoQueryService,
    private todoItemsProxy: TodoItemsProxy,
    private todoReferencesProxy: TodoReferencesProxy,
    private todoListService: TodoListService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.todoQuery$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => this.todoQueriesProxy.getQuery(+params.get('id')))
    );
    this.todoQuery$.subscribe(query => this.onTodoQueryChanged(query));

    this.todoQueryService.queryExecuted$.subscribe(results => this.onQueryExecuted(results));
    this.itemTable.selectedItemEdited.subscribe(args => this.onSelectedItemEdited(args));
  }

  private onSelectedItemEdited(args: ItemEditedEventArgs): void {
    if (this.todoQueryService.inResults(this.todoQuery, args.newItem)) {
      // edited item still meets query criteria, just update item in server
      this.todoItemsProxy.updateItem(args.newItem.id, args.newItem).subscribe();
    } else {
      // edited item no longer meets query criteria, remove from list
      this.itemTable.removeSelected();

      // and update server
      this.todoItemsProxy.updateItem(args.newItem.id, args.newItem).subscribe(() =>
        // re-execute query to make server match client state
        this.todoQueryService.executeQuery(this.todoQuery.id)
      );
    }

    // broadcast item update
    this.todoListService.fireItemEdited(args);
  }

  private onTodoQueryChanged(query: TodoQuery) {
    this.todoQuery = query;
    if (query.operand == QueryOperand.DueDate) {
      this.subTitle = query.dateValue.toDateString();
    }

    // execute query
    this.todoQueryService.executeQuery(query.id);
  }

  private onQueryExecuted(results: TodoQueryResults) {
    if (results.todoQueryId == this.todoQuery.id) {
      this.todoReferences = results.references;
      const items = results.references.map(r => r.item);
      this.itemTable.addItems(items);
    }
  }

  public addItem(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = new TodoItemDialogData(true, this.getDefaultValues());

    const dialogRef = this.dialog.open(TodoItemDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(values => { if (values != null) this.addItemInternal(values); });
  }

  private addItemInternal(values: TodoItemDialogDataValues): void {
    // add new items to default list (id = 1)
    const item = new TodoListItem();
    item.todoListId = 1;
    item.task = values.task;
    item.dueDate = values.dueDate;
    item.important = values.important;
    item.position = -1;   // this will append to default list
    this.todoItemsProxy.createItem(item).subscribe(item => this.onItemCreated(item));
  }

  public onItemCreated(item: TodoListItem) {
    if (this.todoQueryService.inResults(this.todoQuery, item)) {
      // new item meets query criteria, add to list
      this.itemTable.addItem(this.itemTable.count, item);

      // re-execute query to pick up new item reference
      this.todoQueryService.executeQuery(this.todoQuery.id);
    }

    // broadcast new item addition
    this.todoListService.fireItemAdded(item);
  }

  private getDefaultValues(): TodoItemDialogDataValues {
    if (this.todoQuery.operand == QueryOperand.DueDate) {
      return new TodoItemDialogDataValues("", this.todoQuery.dateValue);
    }

    return null;
  }

  public removeItem(): void {
    // remove from list
    const item = this.itemTable.removeSelected();

    // broadcast item removal
    this.todoListService.fireItemRemoved(item);

    // update in server
    this.todoItemsProxy.deleteItem(item.id).subscribe(() =>
      // re-execute query to fix reference positions
      this.todoQueryService.executeQuery(this.todoQuery.id)
    );
  }

  private move(up: boolean) {
    const oldPosition = this.itemTable.selectedItemIndex;
    const newPosition = this.itemTable.moveSelected(up);

    // rearrange in reference list
    const movedReferences = this.todoReferences.splice(oldPosition, 1);
    this.todoReferences.splice(newPosition, 0, movedReferences[0]);

    // update server with new position
    movedReferences[0].position = newPosition;
    this.todoReferencesProxy.moveReference(movedReferences[0].id, movedReferences[0]).subscribe();
  }
}
