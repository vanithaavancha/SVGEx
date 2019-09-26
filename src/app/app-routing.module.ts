import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponentComponent } from './components/main-component/main-component.component';
import { DrawtestComponent } from './components/drawtest/drawtest.component';
import { AppComponent } from './app.component';

const routes: Routes = [
  
  { path: 'LoadDraw', component: DrawtestComponent },
  { path: 'GoToDraw', component: AppComponent },
  {path : '', component : AppComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
