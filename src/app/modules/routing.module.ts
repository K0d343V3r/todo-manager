import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TodoItemsComponent } from '../todo-items/todo-items.component';

const routes: Routes = [
  { path: 'items/:id', component: TodoItemsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class RoutingModule { }