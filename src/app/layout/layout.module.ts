import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BaseLayoutComponent } from './base-layout/base-layout.component';
import { NavbarComponent } from './navbar/navbar.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { SidebarComponent } from './sidebar/sidebar.component';

import { PageLayoutComponent } from './page-layout/page-layout.component';
import { ThematiquesModule } from '../thematiques/thematiques.module';
import { InnovationsModule } from '../innovations/innovations.module';
import { MapModule } from '../map/map.module';
import { AuthLayoutComponent } from './auth-layout/auth-layout.component';



@NgModule({
  declarations: [
    BaseLayoutComponent,
    NavbarComponent,
    SearchBarComponent,
    SidebarComponent,
    PageLayoutComponent,
    AuthLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    SharedModule,
    ThematiquesModule,
    InnovationsModule,
    MapModule
  ]
})
export class LayoutModule { }
