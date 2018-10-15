import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { FormGroup, FormBuilder } from '@angular/forms'

export class TodoListDialogData {
  constructor(public name: string) {
  }
}

@Component({
  selector: 'app-todo-list-dialog',
  templateUrl: './todo-list-dialog.component.html',
  styleUrls: ['./todo-list-dialog.component.css']
})
export class TodoListDialogComponent implements OnInit {
  form: FormGroup;
  name: string;
  title: string;

  constructor(private fb: FormBuilder,
    private dialogRef: MatDialogRef<TodoListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: TodoListDialogData) {
    if (data == null) {
      this.title = "New Todo List"
      this.name = "";
    } else {
      this.title = "Edit Todo List"
      this.name = data.name;
    }

    this.form = fb.group({
      name: [this.name, []]
    });
  }

  ngOnInit() {
  }

  save() {
    const data = new TodoListDialogData(this.form.value.name.trim());
    this.dialogRef.close(data);
  }

  cancel() {
    this.dialogRef.close();
  }
}
