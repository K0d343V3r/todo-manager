import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TodoQuery, TodoQueriesProxy, TodoQueryResults, TodoListItem, TodoItemsProxy, TodoItemReference, TodoReferencesProxy } from '../proxies/todo-api-proxies';
import { TodoItemTableComponent } from '../todo-item-table/todo-item-table.component';
import { TodoQueryService } from '../services/todo-query.service';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { TodoItemDialogComponent, TodoItemDialogData, TodoItemDialogDataValues } from '../todo-item-dialog/todo-item-dialog.component';
import { TodoListService, ItemEditedEventArgs } from "../services/todo-list.service";
import { DueDateService } from '../services/due-date.service'

@Component({
  selector: 'app-todo-results',
  templateUrl: './todo-results.component.html',
  styleUrls: ['./todo-results.component.css']
})
export class TodoResultsComponent implements OnInit, OnDestroy {
  @ViewChild(TodoItemTableComponent) private itemTable: TodoItemTableComponent;
  private todoQuery: TodoQuery;
  private todoReferences: TodoItemReference[];
  private todoQuerySubscription: Subscription;
  private queryExecutedSubscription: Subscription;
  private itemEditedSubscription: Subscription;

  todoQuery$: Observable<TodoQuery>;
  subTitle: string;

  constructor(
    private route: ActivatedRoute,
    private todoQueriesProxy: TodoQueriesProxy,
    private todoQueryService: TodoQueryService,
    private todoItemsProxy: TodoItemsProxy,
    private todoReferencesProxy: TodoReferencesProxy,
    private todoListService: TodoListService,
    private dueDateService: DueDateService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.todoQuery$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.todoQueriesProxy.getQuery(+params.get('id')
        )
      )
    );

    this.todoQuerySubscription = this.todoQuery$.subscribe(query => this.onTodoQueryChanged(query));
    this.itemEditedSubscription = this.itemTable.selectedItemEdited$.subscribe(args => this.onSelectedItemEdited(args));
    this.queryExecutedSubscription = this.todoQueryService.queryExecuted$.subscribe(results => this.onQueryExecuted(results));
  }

  ngOnDestroy() {
    this.todoQuerySubscription.unsubscribe();
    this.queryExecutedSubscription.unsubscribe();
    this.itemEditedSubscription.unsubscribe();
  }

  private onSelectedItemEdited(args: ItemEditedEventArgs): void {
    // update in server
    this.todoItemsProxy.updateItem(args.newItem.id, args.newItem).subscribe(() => {
      // broadcast item update
      this.todoListService.fireItemEdited(args);
    });
  }

  private onTodoQueryChanged(query: TodoQuery) {
    // initialize query
    this.todoQuery = query;

    // TODO
    // initialize subtitle
    //if (query.operand == QueryOperand.DueDate) {
    // this.subTitle = this.dueDateService.getToday().toDateString();
    //} else {
    // this.subTitle = "";
    //}

    // execute query to load item table
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
    dialogConfig.data = new TodoItemDialogData(true, this.todoQueryService.getQueryDefaultValues(this.todoQuery.id));

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
    // assume item will meet query criteria, will be removed if not after refresh
    this.itemTable.addItem(this.itemTable.count, item);

    // broadcast new item addition
    this.todoListService.fireItemAdded(item);
  }

  public removeItem(): void {
    // remove from list
    const item = this.itemTable.removeSelected();

    // update in server
    this.todoItemsProxy.deleteItem(item.id).subscribe(() => {
      // broadcast item removal
      this.todoListService.fireItemRemoved(item);
    });
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
