import { Component, OnInit } from '@angular/core';
import { TodoQuery, TodoQueriesProxy, TodoElement, TodoElementsProxy, QueryOperand, QueryOperator } from '../proxies/todo-api-proxies';
import { Router } from "@angular/router";

@Component({
  selector: 'app-todo-queries',
  templateUrl: './todo-queries.component.html',
  styleUrls: ['./todo-queries.component.css']
})
export class TodoQueriesComponent implements OnInit {
  private readonly myDayQueryId: number = 1;
  private readonly myDayQueryName: string = "My Day";
  myDayQuery: TodoQuery;
  myDayQueryResultCount: number;

  constructor(
    private todoElementsProxy: TodoElementsProxy,
    private todoQueriesProxy: TodoQueriesProxy,
    private router: Router
  ) { }

  ngOnInit() {
    // attempt to update query to today's date
    const myDayQuery = this.createMyDayQuery();
    this.todoQueriesProxy.updateQuery(this.myDayQueryId, myDayQuery).subscribe(query => {
      this.initializeMyDayElement(query);
    }, ex => {
      if (ex.status == 404) {
        // my day query does not exist, create it now
        myDayQuery.id = 0; // ids are auto-generated
        this.todoQueriesProxy.createQuery(myDayQuery).subscribe(query => this.initializeMyDayElement(query));
      }
    });
  }

  private initializeMyDayElement(query: TodoQuery) {
    // initialize query
    this.myDayQuery = query;

    // and route to it
    this.router.navigate([`results/${query.id}`]);
  }

  private createMyDayQuery(): TodoQuery {
    const query = new TodoQuery();
    query.id = this.myDayQueryId;
    query.name = this.myDayQueryName;
    query.operand = QueryOperand.DueDate;
    query.operator = QueryOperator.Equals;
    query.dateValue = new Date();
    return query;
  }
}
