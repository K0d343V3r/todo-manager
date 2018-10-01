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
    MatToolbarModule
} from '@angular/material';

@NgModule({
    imports: [MatInputModule, MatFormFieldModule, MatDialogModule, MatButtonModule, MatToolbarModule, MatIconModule, MatSidenavModule, MatListModule],
    exports: [MatInputModule, MatFormFieldModule, MatDialogModule, MatButtonModule, MatToolbarModule, MatIconModule, MatSidenavModule, MatListModule],
  })
  export class MaterialModule { }