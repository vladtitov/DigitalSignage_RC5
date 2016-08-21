
///<reference path="../../typings/jquery/jquery.d.ts"/>
///<reference path="../../typings/moment/moment.d.ts"/>
///<reference path="../../typings/underscore/underscore.d.ts"/>


///<reference path="../htplayer/ht-payer.ts"/>
///<reference path="../models.ts"/>

///<reference path="../UtilsServices.ts"/>
///<reference path="Library.ts"/>
///<reference path="../htplayer/AssetsModel.ts"/>
///<reference path="../htplayer/viewport-model.ts"/>



module htplayer{

    export var session:string;





    export class PlayerController{
        $view:JQuery;
        player:HTMyPlayer;

        updateManager:UpdateManager;


        showTip(message,obj:JQuery){
            var tip:JQuery = $('#Library #ToolTip').clone().html('<span class="fa fa-minus-circle"></span> <span>'+message+'</span>').offset(obj.offset());
            tip.appendTo('body');
            setTimeout(function () {
                tip.remove();
            },3000)
        }

        callback:string;
        constructor(){

           var params:any= UtilsServices.utils.getUrlParams();
            if(params && params.callback) this.callback =  params.callback;

            UpdateManager.online = true;
            console.log('htplayer comiled          ');





            this.$view = $('#MainPlayerContainer');


            $.ajaxSetup({
                crossDomain: true,
                xhrFields: {
                    withCredentials: true
                }
            });

            this.updateManager = new UpdateManager();

            this.updateManager.onReady = ()=>this.startPlayer();

            this.updateManager.onNeedLogin = ()=>this.onNeedLogin();

            this.updateManager.onNewLayout = (layout:VOLayout)=>this.onNewLayout(layout)



            if(MainLibrary.library.getFilesystem()) {
                MainLibrary.library.onReady= ()=>  this.updateManager.start();
                console.log('playing on device uodated')
            }else {
                this.updateManager.start();
                console.log('playing in browser');
            }
        }




        startPlayer():void{
            this.updateManager.onReady = null;
            if(this.callback) {
                console.log('this.callback  '+this.callback);

                console.log('this.callback  '+decodeURI(this.callback));

            }
           console.log('starting player  device '+this.updateManager.mydevice.id +' layoyt'+ this.updateManager.mylayout.id);
            this.player = new HTMyPlayer('#HTMyPlayer');
            this.player.setNewLayout(this.updateManager.mylayout);
            this.player.appendTo(this.$view);
            this.player.start();
        }
        onNewLayout(layout:VOLayout):void{

        }

        onNeedLogin():void{

            window.location.href = 'player-login.html';
        }








    }

}


$(document).ready(()=>new htplayer. PlayerController())