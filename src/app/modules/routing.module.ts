import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TodoItemsComponent } from '../todo-items/todo-items.component';
import { TodoResultsComponent } from '../todo-results/todo-results.component';

const routes: Routes = [
  { path: 'items/:id', component: TodoItemsComponent },
  { path: 'results/:id', component: TodoResultsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class RoutingModule { }