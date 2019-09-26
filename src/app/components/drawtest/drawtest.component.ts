import { Component, OnInit, ComponentFactoryResolver, ViewContainerRef, Injector } from '@angular/core';
import { ShapeComponent } from '../shape/shape.component';
import { ImageComponent } from '../image/image.component';
import { MousePosition, ShapeProperties } from 'src/app/model/shape';
import { ShapeType } from 'src/app/model/shape-types';
import { ShapeService } from 'src/app/service/shape.service';
import { Field } from 'dynaform';

@Component({
  selector: 'app-drawtest',
  templateUrl: './drawtest.component.html',
  styleUrls: ['./drawtest.component.css']
})
export class DrawtestComponent implements OnInit {
  //shapeService: any;
  title = "Load Existing Drawing";
  svg: any;
  selectedShape: ShapeType;
  shapeValue: string;
  isSelectingPoints: boolean = false;
  selectedComponent: ShapeComponent;
  currentPosition: MousePosition = new MousePosition();
  shapeProperties: ShapeProperties = new ShapeProperties();

  isDrawing: boolean = false;
  isDragging: boolean = false;
  isResizing: boolean = false;

  x : number=0;


  formFields: Field[] = [];
  words2 = [];
  objShapesEx : ShapesEx[]=[
    {originX:496.91 , originY: 374.83, height:35 , width:35}
    ,{originX:144 , originY: 113, height:35 , width:35}
  ]

  constructor(private componentFactoryResolver: ComponentFactoryResolver, private viewContainerRef: ViewContainerRef, private shapeService: ShapeService) { }

  ngOnInit() {
     debugger;
     for(var x=0; x < this.objShapesEx.length; x++){
    // this.GetShapes();
     }
    // // this.DrawImage();
    // for(var x=0; x < this.objShapesEx.length; x++){
    //   this.svg = document.querySelector('svg');
    // console.log('svg:', this.svg);
    //   this.selectShape("Image");
    //   this.onMouseDownMethod(this.objShapesEx[x].originX,this.objShapesEx[x].originY,this.objShapesEx[x].height,this.objShapesEx[x].width);
    //  // console.log(' getShapes '+this.getShapes());
    //  this.onMouseUpMethod();
    // }   
   // this.isDrawing = false; 

  }
  GetShapes(): void {
    debugger;
    
    this.svg = document.querySelector('svg');
    console.log('svg:', this.svg);
    
    // this.DrawImage();
    //for(var x=0; x < this.objShapesEx.length; x++){
      this.selectShape("Image");
      //this.onMouseDownMethod(this.objShapesEx[x].originX,this.objShapesEx[x].originY,this.objShapesEx[x].height,this.objShapesEx[x].width);
      this.onMouseDownMethod(this.objShapesEx[this.x].originX,this.objShapesEx[this.x].originY,this.objShapesEx[this.x].height,this.objShapesEx[this.x].width);
     // console.log(' getShapes '+this.getShapes());
     this.onMouseUpMethod();
     this.x=this.x+1;
   // }   
    
}
  selectShape(shapeType: string): void {
    //debugger;
    this.selectedShape = ShapeType[shapeType];
    this.shapeValue = ShapeType[this.selectedShape];
    this.isSelectingPoints = false;
    console.log('selected shape:', this.selectedShape);
  }
  DrawImage() {
    var img = new ImageComponent();
    var mp = new MousePosition();
    mp.x = 114.91477858121226;
    mp.y = 114.91477858121226;

    img.startDrawing(mp);
  }
  getShapes(): ShapeComponent[] {
    //debugger;
    return this.shapeService.getShapeComponents();
  }
  private buildComponent(shapeType: ShapeType): any {
    console.log('buildComponent for :', shapeType);
    switch (shapeType) {

      case ShapeType.Image:
        return ImageComponent;

    }
    return null;
  }
  private onMouseDownMethod(X:number,Y:number, H:number, W:number): void {
    if (this.selectedShape != ShapeType.NoShape && !this.isSelectingPoints) {
      let injector = Injector.create([], this.viewContainerRef.parentInjector);
      let factory = this.componentFactoryResolver.resolveComponentFactory(this.buildComponent(this.selectedShape));
      let component = factory.create(injector);
      this.selectedComponent = <ShapeComponent>component.instance;
      this.selectedComponent.shape.originX = X;
      this.selectedComponent.shape.originY = Y;
      this.selectedComponent.shape.height = H;
      this.selectedComponent.shape.width = W;
      this.shapeService.setShapeComponent(this.selectedComponent);

      console.log('create component ', this.selectedShape);
      console.log('component : ', this.selectedComponent);
      this.shapeProperties = new ShapeProperties();
      this.shapeProperties.name = this.selectedComponent.shape.shapeProperties.name;
      this.selectedComponent.shape.shapeProperties = Object.assign({}, this.shapeProperties);

      console.log('this.shapeproperties ', this.shapeProperties);
      console.log('this.shapeComponent.shapeproperties ', this.selectedComponent.shape.shapeProperties);
      console.log('component shape : ', this.selectedComponent.shape);
      if (this.canSelectPoints()) {
        this.isSelectingPoints = true;
      } else {
        this.isDrawing = true;
        var CTM = this.svg.getScreenCTM();
        this.currentPosition.x = this.selectedComponent.shape.originX; //(this.selectedComponent.shape.originX - CTM.e) / CTM.a;
        this.currentPosition.y = this.selectedComponent.shape.originY; // (this.selectedComponent.shape.originY - CTM.f) / CTM.d;

        this.selectedComponent.startDrawing(this.currentPosition);
        this.isDrawing = false;
        //this.selectedComponent.endDrawing();
      }
    }
  }
  onMouseUpMethod(): void {
    //this.getMousePosition(event);
    console.log('mouse up svg : ', this.shapeService.getShapeComponents());
    if (this.isSelectingPoints) {
        console.log('SELECT POINTS!!!! ', this.selectedComponent);
        this.selectedComponent.setPoint(this.currentPosition); 
                  
    }
    this.selectedShape = ShapeType.NoShape;
    this.shapeValue = ShapeType[this.selectedShape];
    this.isDrawing = false;
    this.isDragging = false;
    this.isResizing = false;
    
}
  canSelectPoints(): boolean {
    if (this.selectedShape == ShapeType.PolyLine || this.selectedShape == ShapeType.Path) {
      return true;
    }
    return false;
  }

  onMouseDown(event): void {
    this.getMousePosition(event);
    console.log('mouse down SVG : ', this.currentPosition, ', ', event, ', selectedComponent ', this.selectedComponent);
    console.log('shape list :', this.shapeService.getShapeComponents());
    this.deSelectComponents();
    if (event.target.classList.contains('draggable')) {
      console.log('CLASS is DRAGGABLE!!!!!!');
      this.selectedComponent = this.shapeService.findShapeComponent(event.target.id);
      if (this.selectedComponent) {
        console.log('FOUND COMPONENT:', this.selectedComponent);
        this.selectedComponent.isSelected = true;
        this.shapeProperties = Object.assign({}, this.selectedComponent.shape.shapeProperties);
        console.log(event.target.id, ' DRAGGING :', this.selectedComponent);
        this.formFields = this.selectedComponent.getFormFields();
        console.log('form fields : ', this.formFields);
        this.startDragging(event);
      }
    } else if (event.target.classList.contains('resize')) {
      console.log('CLASS is RESIZE!!!!!!');
      this.selectedComponent = this.shapeService.findShapeComponent(event.target.id);
      if (this.selectedComponent) {
        console.log('FOUND RESIZECOMPONENT:', this.selectedComponent);
        this.isResizing = true;
      }
    } else if (this.selectedShape != ShapeType.NoShape && !this.isSelectingPoints) {
      let injector = Injector.create([], this.viewContainerRef.parentInjector);
      let factory = this.componentFactoryResolver.resolveComponentFactory(this.buildComponent(this.selectedShape));
      let component = factory.create(injector);
      this.selectedComponent = <ShapeComponent>component.instance;
      this.shapeService.setShapeComponent(this.selectedComponent);

      console.log('create component ', this.selectedShape);
      console.log('component : ', this.selectedComponent);
      this.shapeProperties = new ShapeProperties();
      this.shapeProperties.name = this.selectedComponent.shape.shapeProperties.name;
      this.selectedComponent.shape.shapeProperties = Object.assign({}, this.shapeProperties);

      console.log('this.shapeproperties ', this.shapeProperties);
      console.log('this.shapeComponent.shapeproperties ', this.selectedComponent.shape.shapeProperties);
      console.log('component shape : ', this.selectedComponent.shape);
      if (this.canSelectPoints()) {
        this.isSelectingPoints = true;
      } else {
        this.isDrawing = true;
        this.selectedComponent.startDrawing(this.currentPosition);
      }
    }

  }

  onMouseMove(event): void {
    this.getMousePosition(event);
    if (this.selectedComponent && (this.isDrawing || this.isSelectingPoints)) {
      this.selectedComponent.draw(this.currentPosition);
    } else if (this.selectedComponent && this.isDragging) {
      console.log('DRAGGING move !!!');
      this.selectedComponent.drag(this.currentPosition);
    } else if (this.isResizing) {
      console.log('RESIZING move !!!');
      this.selectedComponent.resizeShape(this.currentPosition);
    }
  }

  onMouseUp(event): void {
    debugger;
    this.getMousePosition(event);
    console.log('mouse up svg : ', this.shapeService.getShapeComponents());
    if (this.isSelectingPoints) {
      console.log('SELECT POINTS!!!! ', this.selectedComponent);
      this.selectedComponent.setPoint(this.currentPosition);

    }
    this.selectedShape = ShapeType.NoShape;
    this.shapeValue = ShapeType[this.selectedShape];
    this.isDrawing = false;
    this.isDragging = false;
    this.isResizing = false;

    //added by vanitha
  //   if (this.selectedComponent) { 
  //   var strImgName: string = "";

  //   strImgName = this.selectedComponent.shape.shapeProperties.name;
  //   var count: number = strImgName.substring(6) as unknown as number;
  //   if (this.words2.length >= count + 1) {


  //   }
  //   else {
  //     this.words2.push({ value: 'comment1' });
  //   }
  // }
  //end


}
getMousePosition(event: MouseEvent) {
  var CTM = this.svg.getScreenCTM();
  this.currentPosition.x = (event.clientX - CTM.e) / CTM.a;
  this.currentPosition.y = (event.clientY - CTM.f) / CTM.d;
}
startDragging(event): void {
  this.isDragging = true;
  console.log('startDragging()');
  //this.add();
  // Make sure the first transform on the element is a translate transform
}

deSelectComponents() {
  var shapes = this.getShapes();
  for (var i = 0; i < shapes.length; i++) {
    shapes[i].isSelected = false;
  }
}
submit(value: any) {
  console.log('form values : ', value);
  this.selectedComponent.updateShapeProperties(value);
}
}
interface ShapesEx{

  originX: number;
  originY: number;
  height: number;
  width: number;

}
