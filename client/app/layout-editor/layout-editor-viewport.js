"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/**
 * Created by Vlad on 7/21/2016.
 */
var core_1 = require("@angular/core");
var models_1 = require("../services/models");
var drag_playlist_service_1 = require("./drag-playlist-service");
var LayoutEditorViewport = (function () {
    function LayoutEditorViewport(dragService) {
        this.dragService = dragService;
        this.onportclick = new core_1.EventEmitter();
        this.toggleview = true;
        this.borderColor = 'thin solid black';
    }
    LayoutEditorViewport.prototype.ngOnInit = function () {
        // console.log(this.item);
    };
    LayoutEditorViewport.prototype.onDragEnter = function (evt) {
        var _this = this;
        console.log("enter");
        setTimeout(function () {
            _this.dragService.onDragEnd = function (item) {
                _this.item.playlist_id = item.props.id;
                _this.item.image = item.props.image;
                // console.log(this.item.playlistid)
            };
            _this.borderColor = 'thin solid red';
        }, 100);
        /*this.dragService.emitDragEnd.subscribe(
             (item) => {
                 this.item.playlistid = item.id;
                 this.item.image = item.image;
             }
         )*/
    };
    LayoutEditorViewport.prototype.onDragLeave = function (evt) {
        var _this = this;
        //this.dragService.emitDragEnd.unsubscribe();
        setTimeout(function () {
            _this.dragService.onDragEnd = null;
            _this.borderColor = 'thin solid white';
        }, 50);
        console.log("Leave");
    };
    LayoutEditorViewport.prototype.onViewportClick = function (evt) {
        this.onportclick.emit(null);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', models_1.VOViewport)
    ], LayoutEditorViewport.prototype, "item", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], LayoutEditorViewport.prototype, "onportclick", void 0);
    LayoutEditorViewport = __decorate([
        core_1.Component({
            selector: 'layout-editor-viewport',
            template: "    \n    \n                <div class=\"mydiv\"\n                    [style.top]=item.y\n                    [style.left]=item.x \n                    [style.width]=item.width \n                    [style.height]=item.height\n                    [style.border]=borderColor\n                >\n                    \n                            <img class=\"myimage\" src=\"{{ item.image || 'images/transparent.png' }}\" \n                                [style.max-width]=item.width \n                                [style.max-height]=item.height\n                            > <!--width=\"{{ item.width }}\" height=\" {{ item.height }}\"-->\n                        \n                    \n                    \n                        \n                    <div class=\"cover\"\n                        (dragenter)=\"onDragEnter($event)\"\n                        (dragleave)=\"onDragLeave($event)\"\n                        (click)=\"onViewportClick($event)\"\n                        >                \n                    </div>      \n                         \n                </div>\n            ",
            styles: ["\n             .mydiv {\n                 background-color: whitesmoke; \n                       \n                 position: absolute;\n                 }\n                /*.card-256x320{*/\n                    /*width: 270px;*/\n                    /*height: 320px;*/\n                    /*background-color: #fcfcfc;*/\n                    /*margin: 10px;*/\n                    /*float: left;;*/\n                /*}*/\n                \n                .mydiv .mythumb{\n                    position: relative;\n                    /*width: 270px;*/\n                    /*height: 320px;*/\n                    box-shadow: grey 5px 5px 10px;\n                \n                }\n                \n                .mydiv .mythumb .props{\n                    position: absolute;\n                    bottom: 0;\n                    padding: 3px 5px 0 9px;\n                    height: 60px;\n                }\n                \n                \n                .mydiv .myimage-container{\n                    /*width:260px;*/\n                    /*height:260px;*/\n                    background-color: #EFF5FB; /*#e7f1ff;*/\n                \n                    margin: 4px;\n                    position: absolute;\n                }\n                \n                .mydiv .myimage{\n\n                    border: 1px solid #c3c3c3;\n                    position:absolute;\n                    top:0;\n                    bottom: 0;\n                    left: 0;\n                    right:0;\n                    margin:auto;\n                }\n\n             .cover{\n                 position: absolute;\n                 top:0;\n                 left: 0;\n                 width: 100%;\n                 height: 100%;\n                 z-index: 1000;\n                 background-color: rgba(255, 255, 255, 0.1);\n             }\n            "],
            directives: [],
            providers: []
        }), 
        __metadata('design:paramtypes', [drag_playlist_service_1.DragPlayListService])
    ], LayoutEditorViewport);
    return LayoutEditorViewport;
}());
exports.LayoutEditorViewport = LayoutEditorViewport;
//# sourceMappingURL=layout-editor-viewport.js.map