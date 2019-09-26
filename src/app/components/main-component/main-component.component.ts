import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-component',
  templateUrl: './main-component.component.html',
  styleUrls: ['./main-component.component.css']
})
export class MainComponentComponent implements OnInit {

  constructor(private _router:Router) { }

  ngOnInit() {
  }
  LoadDraw(){
    debugger;
    this._router.navigate(["LoadDraw"]);
  }
  GoToDraw(){
    debugger;
    this._router.navigate(["GoToDraw"]);
  }
  

}
