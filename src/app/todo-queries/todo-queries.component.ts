import { Component, OnInit } from '@angular/core';
import { TodoQuery, TodoQueryElement, TodoQueriesProxy, TodoElement, TodoElementsProxy, QueryOperand, QueryOperator, TodoListItem, TodoQueryResults } from '../proxies/todo-api-proxies';
import { Router } from "@angular/router";
import { TodoListService, ItemEditedEventArgs } from "../services/todo-list.service";
import { TodoQueryService } from '../services/todo-query.service';
import { DueDateService } from '../services/due-date.service'

@Component({
  selector: 'app-todo-queries',
  templateUrl: './todo-queries.component.html',
  styleUrls: ['./todo-queries.component.css']
})
export class TodoQueriesComponent implements OnInit {
  private readonly urlSection = "results";

  myDayElement: TodoQueryElement;
  importantElement: TodoQueryElement;
  myTasksElement: TodoElement;

  constructor(
    private todoElementsProxy: TodoElementsProxy,
    private todoQueriesProxy: TodoQueriesProxy,
    private todoListService: TodoListService,
    private todoQueryService: TodoQueryService,
    private dueDateService: DueDateService,
    private router: Router
  ) {
    this.myDayElement = new TodoQueryElement();
    this.myDayElement.id = 1;
    this.myDayElement.name = "My Day";
    this.myDayElement.position = 0;
    this.myDayElement.query = new TodoQuery();
    this.myDayElement.query.id = this.myDayElement.id;
    this.myDayElement.query.name = this.myDayElement.name;
    this.myDayElement.query.operand = QueryOperand.DueDate;
    this.myDayElement.query.operator = QueryOperator.Equals;
    this.myDayElement.query.dateValue = dueDateService.toEndOfDay(new Date());

    this.importantElement = new TodoQueryElement();
    this.importantElement.id = 2;
    this.importantElement.name = "Important";
    this.importantElement.position = 1;
    this.importantElement.query = new TodoQuery();
    this.importantElement.query.id = this.importantElement.id;
    this.importantElement.query.name = this.importantElement.name;
    this.importantElement.query.operand = QueryOperand.Important;
    this.importantElement.query.operator = QueryOperator.Equals;
    this.importantElement.query.boolValue = true;

    this.myTasksElement = new TodoElement();
    this.myTasksElement.id = 1;
    this.myTasksElement.name = "My Tasks";
  }

  ngOnInit() {
    // attempt to update my day query to today's date
    this.todoQueriesProxy.updateQuery(this.myDayElement.query.id, this.myDayElement.query).subscribe(() => {
      this.createImportantQuery();
    }, ex => {
      if (ex.status == 404) {
        // my day query does not exist, create it now
        const query = this.myDayElement.query.clone();
        query.id = 0;
        this.todoQueriesProxy.createQuery(query).subscribe(() => this.createImportantQuery());
      }
    });

    // update default list name
    this.todoElementsProxy.updateListElement(this.myTasksElement.id, this.myTasksElement).subscribe(
      // initialize child counts
      element => this.myTasksElement.childCount = element.childCount
    );

    this.todoListService.itemAdded$.subscribe(item => this.onListItemsChanged(item, true));
    this.todoListService.itemRemoved$.subscribe(item => this.onListItemsChanged(item, false));
    this.todoListService.itemEdited$.subscribe(args => this.onItemEdited(args));
    this.todoQueryService.queryExecuted$.subscribe(results => this.onQueryExecuted(results));
  }

  private onItemEdited(args: ItemEditedEventArgs) {
    this.checkQueryCountsEdit(this.myDayElement, args);
    this.checkQueryCountsEdit(this.importantElement, args);
  }

  private checkQueryCountsEdit(element: TodoQueryElement, args: ItemEditedEventArgs) {
    const wasInResults = this.todoQueryService.inResults(element.query, args.oldItem);
    const isInResults = this.todoQueryService.inResults(element.query, args.newItem);

    if (wasInResults && !isInResults) {
      element.childCount--;
    } else if (!wasInResults && isInResults) {
      element.childCount++;
    }
  }

  private onQueryExecuted(results: TodoQueryResults) {
    if (results.todoQueryId == this.myDayElement.id) {
      this.myDayElement.childCount = results.references.length;
    } else if (results.todoQueryId == this.importantElement.id) {
      this.importantElement.childCount = results.references.length;
    }
  }

  private onListItemsChanged(item: TodoListItem, add: boolean) {
    if (item.todoListId == this.myTasksElement.id) {
      if (add) {
        this.myTasksElement.childCount++;
      } else {
        this.myTasksElement.childCount--;
      }
    }

    this.checkQueryCounts(this.myDayElement, item, add);
    this.checkQueryCounts(this.importantElement, item, add);
  }

  private checkQueryCounts(element: TodoQueryElement, item: TodoListItem, add: boolean) {
    const inResults = this.todoQueryService.inResults(element.query, item);
    if (inResults && add) {
      element.childCount++;
    } else if (inResults && !add) {
      element.childCount--;
    }
  }

  private createImportantQuery() {
    // attempt to load important query
    this.todoElementsProxy.getQueryElement(this.importantElement.id).subscribe(() => {
      // all queries exist at this point, refresh them
      this.refreshQueries();
    }, ex => {
      if (ex.status == 404) {
        // important query does not exist, create it
        const query = this.importantElement.query.clone();
        query.id = 0;
        this.todoQueriesProxy.createQuery(query).subscribe(() => { this.refreshQueries(); });
      }
    });
  }

  private refreshQueries() {
    // execute queries directly or via routing to results component
    if (this.router.url == "/") {
      // we are at home, route to my day query
      this.router.navigate([`results/${this.myDayElement.id}`]);
    } else {
      const parts: string[] = this.router.url.split("/");
      if (parts[1] != this.urlSection || +parts[2] == this.myDayElement.id) {
        this.importantElement.childCount = 0;
        this.todoQueryService.executeQuery(this.importantElement.id);
      }
      if (parts[1] != this.urlSection || +parts[2] == this.importantElement.id) {
        this.myDayElement.childCount = 0;
        this.todoQueryService.executeQuery(this.myDayElement.id);
      }
    }
  }
}
