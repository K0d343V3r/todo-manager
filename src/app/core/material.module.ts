import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
    MatSidenavModule,
    MatListModule,
    MatToolbarModule
} from '@angular/material';

@NgModule({
    imports: [MatToolbarModule, MatSidenavModule, MatListModule],
    exports: [MatToolbarModule, MatSidenavModule, MatListModule],
  })
  export class MaterialModule { }