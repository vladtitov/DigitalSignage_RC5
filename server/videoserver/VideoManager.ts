import {DBDriver} from "../db/dbDriver";
import {VOAsset} from "../../client/app/services/models";
/**
 * Created by Vlad on 8/25/2016.
 */
import * as fs from 'fs';
import * as Q from 'q';
import * as path from 'path';

import * as http from 'http';
declare var WWW:string;


export class FileDownloader{

    destination:string;
    private server:string ='http://192.168.1.10:56555';
    onComplete:Function;
    constructor(private url:string, private folder:string,private filename:string){

    }

    getFile():void{
        this.downloader((err)=>{
            if(this.onComplete) this.onComplete(err)
        })
    }



    downloader(callBack:Function):void{

        var dest = path.resolve(WWW+'/'+this.folder+'/'+this.filename);

        var file:any = fs.createWriteStream(dest);
        var url:string = this.server+'/'+this.url;
       // console.log(url,dest);


        http.get(url,function(response){
            response.pipe(file);
            file.on('finish', function() {
                file.close(callBack);  // close() is async, call cb after close completes.
            }).on('error', function(err) {
                fs.unlink(dest);
                if (callBack) callBack(err);
            });
        } )
    }
}



export  class VideoManager{


    downloadFiles(asset:VOAsset,folder:string): Q.Promise<any>{
        var def: Q.Deferred<any> = Q.defer();


        folder+='/userVideos';

        var down:FileDownloader = new FileDownloader(asset.folder+'/'+asset.filename,folder,asset.filename);
        down.onComplete=(err)=>{
            if(err)def.reject(err);
            else def.resolve(asset)
        }
        down.getFile();
        var thumbs:string[] = asset.thumb.split(',');
        thumbs.forEach((filename:string)=>{
            var d:FileDownloader = new FileDownloader(asset.folder+'/'+filename,folder,filename);
            d.getFile();
        })



        return def.promise;
    }


    updateDatabases(asset:VOAsset,folder:string): Q.Promise<any>{
        var def: Q.Deferred<any> = Q.defer();
        var db:DBDriver = new DBDriver(null);
        var db2:DBDriver = new DBDriver(folder);

        console.log('  updateDatabases  folder   '+folder);

        db.updateRow({id:asset.id,status:asset.status},'process').done(
            res=>{
                console.log(res);
                var asset2:VOAsset = new VOAsset(asset)
                asset2.process_id = asset.id;
                delete asset2.id;
                delete asset2.token;
                db2.updateRowByColumn(asset2,'process_id','assets').done(
               res=> def.resolve(res)
                ,err=>def.reject(err)
            )}
            ,err=>def.reject(err)
        );



        return def.promise;
    }

    finalize(asset:VOAsset,folder:string): Q.Promise<any>{
        var asset2:VOAsset = new VOAsset({id:asset.id,status:asset.status});
        return this.updateDatabases(asset2,folder)
    }

    registerReady(asset:VOAsset): Q.Promise<any>{
        var def: Q.Deferred<any> = Q.defer();
        var db:DBDriver = new DBDriver(null);
        db.selectById(asset.id,'process').done(
            row =>{
               if(row){
                   this.updateDatabases(asset,row.folder).done(
                       res=>def.resolve(asset)
                       ,err=>def.reject(err)
                   )

               }else def.reject('notexists')
            }
            ,err=>def.reject(err)
        )


        return def.promise;
    }
    getNextVideo(): Q.Promise<any>{
        var def: Q.Deferred<any> = Q.defer();
        var db:DBDriver = new DBDriver(null);
        var sql:string = 'SELECT * FROM process';

        db.queryAll(sql).done(
            res=>{
                var out:VOAsset;
                for(var i=0,n= res.length;i<n;i++){
                    var asset:VOAsset = res[i]
                    //console.log(WWW+'/'+asset.path);
                    if(fs.existsSync(WWW+'/'+asset.path)){
                        out = asset
                        break
                    }else db.deleteById(asset.id,'process');
                }
                def.resolve(out);
            }
            ,err=>def.reject(err)
        )

        return def.promise;
    }
}
