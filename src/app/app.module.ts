import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from "./core/material.module";
import { TodoListsComponent } from './todo-lists/todo-lists.component';
import { HttpClientModule } from '@angular/common/http';
import { TodoItemsProxy, TodoListsProxy } from './proxies/todo-api-proxies';

@NgModule({
  declarations: [
    AppComponent,
    TodoListsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule
  ],
  providers: [TodoListsProxy, TodoItemsProxy],
  bootstrap: [AppComponent]
})
export class AppModule { }
