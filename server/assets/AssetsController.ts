import Q = require('q');

//import {AssetTable} from "../assets/AssetTable";
import Promise = Q.Promise;

import {VOAsset, VOPlayLists_Assets, VOPlaylist} from "../../client/app/services/models";
import {DBDriver} from "../db/dbDriver";



export class AssetsController{
    constructor(){
    }

    getUsedPlaylist(id:number, folder:string): Q.Promise<any>{
        var db = new DBDriver(folder);
        return db.queryAll('SELECT DISTINCT playlist_id AS id, playlists.label ' +
                            'FROM playlists_assets ' +
                            'LEFT JOIN playlists ON playlists.id = playlists_assets.playlist_id ' +
                            'WHERE asset_id = ' + id)
    }

    deleteAsset(id:number, folder:string): Q.Promise<any>{
        var deferred: Q.Deferred<any> = Q.defer();

        var timestamp = Math.floor(Date.now() / 1000);

        var db = new DBDriver(folder);
        db.runQuery('UPDATE playlists SET timestamp = ' + timestamp +
                    ' WHERE id IN ' +
                    '(SELECT DISTINCT playlist_id AS id FROM playlists_assets ' +
                    'LEFT JOIN playlists ON playlists.id = playlists_assets.playlist_id ' +
                    'WHERE asset_id = ' + id + ')').done(
            res => db.runQuery('DELETE FROM playlists_assets WHERE asset_id = '+ id).done(
                res =>  db.runQuery('DELETE FROM assets WHERE id = ' + id).done(
                    res => deferred.resolve(res)
                    , err => deferred.reject(err)
                )
                , err => deferred.reject(err)
            )
            , err => deferred.reject(err)
        );
        return deferred.promise;
    }

}
