import { Component, ContentChild, TemplateRef, OnInit, ComponentFactoryResolver, ViewContainerRef, Injector, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { ShapeComponent } from './components/shape/shape.component';
import { ShapeProperties, MousePosition } from './model/shape';
import { ShapeType, ToolType } from './model/shape-types';
import { ShapeService } from './service/shape.service';
import { LineComponent } from './components/line/line.component';
import { CircleComponent } from './components/circle/circle.component';
import { RectangleComponent } from './components/rectangle/rectangle.component';
import { SquareComponent } from './components/square/square.component';
import { EllipseComponent } from './components/ellipse/ellipse.component';
import { TextComponent } from './components/text/text.component';
import { ImageComponent } from './components/image/image.component';
import { PolyLineComponent } from './components/polyline/polyline.component';
import { PathComponent } from './components/path/path.component';
import { DynamicFormComponent } from 'dynaform';

import { Field } from 'dynaform';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    title = 'SVG Drawing Tool';

    words2 = [];

    @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

    svg: any;
    currentPosition: MousePosition = new MousePosition();

    shapeProperties: ShapeProperties = new ShapeProperties();

    selectedShape: ShapeType;
    shapeValue: string;

    selectedTool: ToolType;

    selectedComponent: ShapeComponent;

    isDragging: boolean = false;
    isDrawing: boolean = false;
    isResizing: boolean = false;
    isSelectingPoints: boolean = false;

    formFields: Field[] = [];

    @ContentChild(TemplateRef) shapeTemplate: TemplateRef<any>;

    constructor(private componentFactoryResolver: ComponentFactoryResolver, private viewContainerRef: ViewContainerRef, private shapeService: ShapeService) {
        console.log('AppComponent constructor');
    }

    ngOnInit(): void {
        this.svg = document.querySelector('svg');
        console.log('svg:', this.svg);
        this.selectedShape = ShapeType.NoShape;
        console.log('AppComponent shapeProperties:', this.shapeProperties);
    }

    ngOnChanges() {
    }

    selectShape(shapeType: string): void {
        //debugger;
        this.selectedShape = ShapeType[shapeType];
        this.shapeValue = ShapeType[this.selectedShape];
        this.isSelectingPoints = false;
        console.log('selected shape:', this.selectedShape);
    }

    clearShapes(): void {
        debugger;
        this.shapeService.removeAllShapeComponents();
        this.selectedShape = ShapeType.NoShape;
        this.shapeValue = ShapeType[this.selectedShape];
        this.formFields = [];
    }

    getShapes(): ShapeComponent[] {
        return this.shapeService.getShapeComponents();
    }

    selectTool(toolType: string): void {
        this.selectedTool = ToolType[toolType];
        this.selectedShape = ShapeType.NoShape;
        this.shapeValue = ShapeType[this.selectedShape];
        console.log('selected tool:', toolType);
        if (this.selectedTool == ToolType.Pointer) {
            if (this.isSelectingPoints) {
                this.selectedComponent.endDrawing();
                this.isSelectingPoints = false;
            }
        }
    }

    getMousePosition(event: MouseEvent) {
        var CTM = this.svg.getScreenCTM();
        this.currentPosition.x = (event.clientX - CTM.e) / CTM.a;
        this.currentPosition.y = (event.clientY - CTM.f) / CTM.d;
    }

    private buildComponent(shapeType: ShapeType): any {
        console.log('buildComponent for :', shapeType);
        switch (shapeType) {
            case ShapeType.Line:
                return LineComponent;
            case ShapeType.Circle:
                return CircleComponent;
            case ShapeType.Rectangle:
                return RectangleComponent;
            case ShapeType.Square:
                return SquareComponent;
            case ShapeType.Ellipse:
                return EllipseComponent;
            case ShapeType.TextBox:
                return TextComponent;
            case ShapeType.Image:
                this.add();
                return ImageComponent;
            case ShapeType.PolyLine:
                return PolyLineComponent;
            case ShapeType.Path:
                return PathComponent;
        }
        return null;
    }

    canSelectPoints(): boolean {
        if (this.selectedShape == ShapeType.PolyLine || this.selectedShape == ShapeType.Path) {
            return true;
        }
        return false;
    }

    deSelectComponents() {
        var shapes = this.getShapes();
        for (var i = 0; i < shapes.length; i++) {
            shapes[i].isSelected = false;
        }
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
        
    }

    startDragging(event): void {
        this.isDragging = true;
        console.log('startDragging()');
        //this.add();
        // Make sure the first transform on the element is a translate transform
    }

    dragComponent(event): void {
        console.log('dragComponent()');
    }

    endDragging(): void {
        this.selectedComponent = null;
        console.log('endDragging()');
       // this.add(); 
    }

    rgbToHex(r, g, b) {
        if (r > 255 || g > 255 || b > 255)
            throw "Invalid color component";
        return ((r << 16) | (g << 8) | b).toString(16);
    }

    submit(value: any) {
        console.log('form values : ', value);
        this.selectedComponent.updateShapeProperties(value);
    }

    add() {
        debugger;
        this.words2.push({value: ''});
      }

}
