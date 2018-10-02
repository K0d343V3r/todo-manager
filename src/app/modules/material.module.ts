import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatToolbarModule
} from '@angular/material';

@NgModule({
    imports: [MatTableModule, MatInputModule, MatFormFieldModule, MatDialogModule, MatButtonModule, MatToolbarModule, MatIconModule, MatSidenavModule, MatListModule],
    exports: [MatTableModule, MatInputModule, MatFormFieldModule, MatDialogModule, MatButtonModule, MatToolbarModule, MatIconModule, MatSidenavModule, MatListModule],
  })
  export class MaterialModule { }