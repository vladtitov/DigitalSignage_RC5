/**
 * Created by Vlad on 7/26/2016.
 */
import {Component} from "@angular/core";
import {ROUTER_DIRECTIVES, ActivatedRoute, Router, RouterConfig} from '@angular/router';
import {VOLayout, VODevice} from "../services/models";
import {LayoutsListCards} from "./layouts-list-cards";
import {LayoutEditorService} from "../layout-editor/layout-editor-service";
import {UpdateResult} from "../../../server/db/dbDriver";
import {DeviceEditorService} from "../device/device-editor-service";
@Component({
    selector:'layouts-assembled'
    ,template:`
<div>
            <div class ="panel-heading">
                <h3>Layouts Manager</h3>
                <nav>
                    <a [routerLink]="['../layout-template/',-1]" class="btn btn-default"><span class="fa fa-plus"></span> Create New Layout</a>
                    <a class="btn btn-default" [class.disabled]="!currentItem" (click)="onEditClick()"> <span class="fa fa-edit" ></span> Edit Layout</a>
                    <a #mybtn class="btn btn-default" [class.disabled]="!currentItem" (click)="onDeleteClick($evtnt,mybtn)"><span class="fa fa-minus"></span> Delete Layout</a>
                </nav>
            </div>
            <div class="panel-body">
                <layouts-list-cards [changesResult]="changesResult" (onselect)="onLayoutSelected($event)"  ></layouts-list-cards>
            </div>
</div>
`
    ,directives:[ROUTER_DIRECTIVES,LayoutsListCards]
    ,providers:[LayoutEditorService, DeviceEditorService]
})


export class LayoutsAssembled{
    currentItem:VOLayout;
    changesResult:UpdateResult;
    error:string;

    constructor(
        private ar:ActivatedRoute
        , private router:Router
        , private layoutsEditorService: LayoutEditorService
        , private deviceEditorService: DeviceEditorService
    ){}

    onLayoutSelected(item:VOLayout):void{
        this.currentItem = item;

        if(item.usedDevice) return;
        // console.log('ITEM ', item);
        // console.log('this.currentItem ', this.currentItem);
        this.deviceEditorService.getUsedDevice(item.props)
            .subscribe((devices:VODevice[]) => {
                item.usedDevice = devices;
                // console.log('res ', item.usedDevice);
            });
    }
    onEditClick():void{
        if (this.currentItem) {
            let link = ['/layout-editor','library' ,this.currentItem.props.id];
            this.router.navigate(link);
        }
    }

    onDeleteClick(evt,btn):void{
        var strLabels:string;

        if(this.currentItem.usedDevice && this.currentItem.usedDevice.length){
            var labelArr:string[] = this.currentItem.usedDevice.map(function (item) {
                return item.label;
            });
            strLabels = labelArr.join(', ');
        } else {
            strLabels = 'no devices';
        }

        if(this.currentItem && confirm('You want to delete asseble "'+this.currentItem.props.label+'"?\n' +
            'Used devices: ' + strLabels)){
            this.layoutsEditorService.deleteLayoutById(this.currentItem.props.id)
                .subscribe(
                    res=>this.changesResult = res,
                    err=>this.error=err
                );
                    // if(this.devicelist1) this.devicelist1.refreshData();
        }
    }
}
