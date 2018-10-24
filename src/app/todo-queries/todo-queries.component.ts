import { Component, OnInit } from '@angular/core';
import { TodoQuery, TodoQueryElement, TodoQueriesProxy, TodoElement, TodoElementsProxy, QueryOperand, QueryOperator, TodoListItem, TodoQueryResults } from '../proxies/todo-api-proxies';
import { Router } from "@angular/router";
import { TodoListService, ItemEditedEventArgs } from "../services/todo-list.service";
import { TodoQueryService } from '../services/todo-query.service';
import { DueDateService } from '../services/due-date.service'
import { Observable, forkJoin } from 'rxjs';

@Component({
  selector: 'app-todo-queries',
  templateUrl: './todo-queries.component.html',
  styleUrls: ['./todo-queries.component.css']
})
export class TodoQueriesComponent implements OnInit {
  private readonly urlSection = "results";
  private updatableElements: TodoQueryElement[] = [];

  myTasksElement: TodoElement;
  queryElements: TodoQueryElement[] = [];


  constructor(
    private todoElementsProxy: TodoElementsProxy,
    private todoQueriesProxy: TodoQueriesProxy,
    private todoListService: TodoListService,
    private todoQueryService: TodoQueryService,
    private dueDateService: DueDateService,
    private router: Router
  ) {
    // my day query is first
    let element = new TodoQueryElement();
    element.id = this.queryElements.length + 1;
    element.name = "My Day";
    element.position = this.queryElements.length;
    element.query = new TodoQuery();
    element.query.id = element.id;
    element.query.name = element.name;
    element.query.operand = QueryOperand.DueDate;
    element.query.operator = QueryOperator.Equals;
    element.query.dateValue = dueDateService.toEndOfDay(new Date());
    this.queryElements.push(element);
    this.updatableElements.push(element);

    // followed by important query
    element = new TodoQueryElement();
    element.id = this.queryElements.length + 1;
    element.name = "Important";
    element.position = this.queryElements.length;
    element.query = new TodoQuery();
    element.query.id = element.id;
    element.query.name = element.name;
    element.query.operand = QueryOperand.Important;
    element.query.operator = QueryOperator.Equals;
    element.query.boolValue = true;
    this.queryElements.push(element);

    this.myTasksElement = new TodoElement();
    this.myTasksElement.id = 1;
    this.myTasksElement.name = "My Tasks";
  }

  ngOnInit() {
    this.todoElementsProxy.getAllQueryElements().subscribe(elements => {
      if (elements.length == 0) {
        // no queries yet, create them (no need to refresh)
        this.createQueries(0);
      } else if (this.updatableElements.length == 0) {
        // no queries to update, just refresh them
        this.refreshQueries();
      } else {
        // update queries (refreshes when updates complete)
        this.updateQueries();
      }
      if (this.router.url == "/") {
        // we are at Home, route to routing query
        this.router.navigate([`results/${this.routingQueryId}`]);
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

  private get routingQueryId(): number {
    return this.queryElements[0].query.id;
  }

  private createQueries(index: number) {
    // recursively create queries to get correct order
    const query = this.queryElements[index].query.clone();
    query.id = 0;
    this.todoQueriesProxy.createQuery(query).subscribe(() => {
      if (index < this.queryElements.length - 1) {
        this.createQueries(index + 1)
      }
    });
  }

  private updateQueries() {
    const requests = this.updatableElements.map(e =>
      this.todoQueriesProxy.updateQuery(e.query.id, e.query)
    );

    // refresh queries only when all elements are updated
    forkJoin(requests).subscribe(() => this.refreshQueries());
  }

  private onItemEdited(args: ItemEditedEventArgs) {
    this.queryElements.forEach(element => this.checkQueryCountsEdit(element, args));
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
    const element = this.queryElements.find(e => e.id == results.todoQueryId);
    if (element != null) {
      // this query executed, get the latest result count
      element.childCount = results.references.length;
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

    this.queryElements.forEach(e => this.checkQueryCounts(e, item, add));
  }

  private checkQueryCounts(element: TodoQueryElement, item: TodoListItem, add: boolean) {
    const inResults = this.todoQueryService.inResults(element.query, item);
    if (inResults && add) {
      element.childCount++;
    } else if (inResults && !add) {
      element.childCount--;
    }
  }

  private refreshQueries() {
    let routedToQueryId = 0;
    if (this.router.url == "/") {
      // at Home, routing will take care of refresh
      routedToQueryId = this.routingQueryId;
    } else {
      const parts: string[] = this.router.url.split("/");
      if (parts[1] == this.urlSection) {
        // we are routing to a query (not list)
        routedToQueryId = +parts[2];
      }
    }

    // do not execute a query if we are routing to it
    this.queryElements.forEach((e, i) => {
      if (e.query.id != routedToQueryId) {
        this.todoQueryService.executeQuery(e.query.id);
      }
    });
  }
}
