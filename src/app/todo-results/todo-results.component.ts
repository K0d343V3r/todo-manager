import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TodoQuery, TodoQueriesProxy, TodoQueryResults, TodoListItem, QueryOperand, QueryOperator, TodoItemsProxy, TodoItemReference } from '../proxies/todo-api-proxies';
import { TodoItemTableComponent } from '../todo-item-table/todo-item-table.component';
import { TodoQueryService } from '../services/todo-query.service';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { TodoItemDialogComponent, TodoItemDialogData, TodoItemDialogDataValues } from '../todo-item-dialog/todo-item-dialog.component';

@Component({
  selector: 'app-todo-results',
  templateUrl: './todo-results.component.html',
  styleUrls: ['./todo-results.component.css']
})
export class TodoResultsComponent implements OnInit {
  @ViewChild(TodoItemTableComponent) private itemTable: TodoItemTableComponent;
  private todoQuery: TodoQuery;
  todoQuery$: Observable<TodoQuery>;
  subTitle: string;

  constructor(
    private route: ActivatedRoute,
    private todoQueriesProxy: TodoQueriesProxy,
    private todoQueryService: TodoQueryService,
    private todoItemsProxy: TodoItemsProxy,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.todoQuery$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => this.todoQueriesProxy.getQuery(+params.get('id')))
    );
    this.todoQuery$.subscribe(query => this.onTodoQueryChanged(query));

    this.todoQueryService.queryExecuted$.subscribe(results => this.onQueryExecuted(results));
    this.itemTable.selectedItemEdited.subscribe(item => this.onSelectedItemEdited(item));
  }

  private onSelectedItemEdited(item: TodoListItem): void {
    if (!this.todoQueryService.inResults(this.todoQuery, item)) {
      // edited item no longer meets query criteria, remove from list
      this.itemTable.removeSelected(true);
    }

    // update in server
    this.todoItemsProxy.updateItem(item.id, item).subscribe(() =>
      // re-execute query to make server match client state
      this.todoQueryService.executeQuery(this.todoQuery.id)
    );
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
    item.position = -1;   // this will append to default list
    this.todoItemsProxy.createItem(item).subscribe(item => this.onItemCreated(item));
  }

  public onItemCreated(item: TodoListItem) {
    if (this.todoQueryService.inResults(this.todoQuery, item)) {
      // new item meets query criteria, add to list
      this.itemTable.addItem(this.itemTable.count, item);
    }

    // re-execute query to pick up new item reference
    this.todoQueryService.executeQuery(this.todoQuery.id);
  }

  private getDefaultValues(): TodoItemDialogDataValues {
    if (this.todoQuery.operand == QueryOperand.DueDate) {
      return new TodoItemDialogDataValues("", this.todoQuery.dateValue);
    }

    return null;
  }

  public removeItem(): void {
    const id = this.itemTable.removeSelected();

    // update in server
    this.todoItemsProxy.deleteItem(id).subscribe(() =>
      // re-execute query to fix reference positions
      this.todoQueryService.executeQuery(this.todoQuery.id)
    );
  }
}
