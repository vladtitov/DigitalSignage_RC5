"use strict";
var dbDriver_1 = require("../db/dbDriver");
var models_1 = require("../../client/app/services/models");
var fs = require('fs');
var Q = require('q');
var path = require('path');
var http = require('http');
var FileDownloader = (function () {
    function FileDownloader(url, folder, filename) {
        this.url = url;
        this.folder = folder;
        this.filename = filename;
        this.server = 'http://192.168.1.10:56555';
    }
    FileDownloader.prototype.getFile = function () {
        var _this = this;
        this.downloader(function (err) {
            if (_this.onComplete)
                _this.onComplete(err);
        });
    };
    FileDownloader.prototype.downloader = function (callBack) {
        var dest = path.resolve(WWW + '/' + this.folder + '/' + this.filename);
        var file = fs.createWriteStream(dest);
        var url = this.server + '/' + this.url;
        http.get(url, function (response) {
            response.pipe(file);
            file.on('finish', function () {
                file.close(callBack);
            }).on('error', function (err) {
                fs.unlink(dest);
                if (callBack)
                    callBack(err);
            });
        });
    };
    return FileDownloader;
}());
exports.FileDownloader = FileDownloader;
var VideoManager = (function () {
    function VideoManager() {
    }
    VideoManager.prototype.downloadFiles = function (asset, folder) {
        var def = Q.defer();
        folder += '/userVideos';
        var thumbs = asset.thumb.split(',');
        var down = new FileDownloader(asset.folder + '/' + asset.filename, folder, asset.filename);
        down.onComplete = function (err) {
            if (err)
                def.reject(err);
            else {
                asset.path = folder + '/' + asset.filename;
                var ar = thumbs.map(function (item) {
                    return folder + '/' + item;
                });
                asset.thumb = ar.join(',');
                def.resolve(asset);
            }
        };
        down.getFile();
        thumbs.forEach(function (filename) {
            var d = new FileDownloader(asset.folder + '/' + filename, folder, filename);
            d.getFile();
        });
        return def.promise;
    };
    VideoManager.prototype.updateStatus = function (asset, folder) {
        var def = Q.defer();
        var db = new dbDriver_1.DBDriver(null);
        db.updateRow({ id: asset.id, status: asset.status }, 'process').done(function (res) {
            var db2 = new dbDriver_1.DBDriver(folder);
            db2.updateRowByColumn({ process_id: asset.id, status: asset.status }, 'process_id', 'assets').done(function (res) { return def.resolve(asset); }, function (err) { return def.reject(err); });
        }, function (err) { return def.reject(err); });
        return def.promise;
    };
    VideoManager.prototype.finalize = function (asset, folder) {
        var _this = this;
        var def = Q.defer();
        this.saveAssetData(asset, folder).done(function (res) { return _this.updateStatus(asset, folder).done(function (res) { return def.resolve(asset); }, function (err) { return def.reject(err); }); }, function (err) { return def.reject(err); });
        return def.promise;
    };
    VideoManager.prototype.saveAssetData = function (asset, folder) {
        var db2 = new dbDriver_1.DBDriver(folder);
        asset.process_id = asset.id;
        return db2.updateRowByColumn(new models_1.VOAsset(asset), 'process_id', 'assets');
    };
    VideoManager.prototype.registerProcessed = function (asset) {
        var _this = this;
        var def = Q.defer();
        var db = new dbDriver_1.DBDriver(null);
        db.selectById(asset.id, 'process').done(function (row) {
            if (row) {
                var folder = row.folder;
                _this.updateStatus(asset, folder).done(function (res) { return def.resolve(folder); }, function (err) { return def.reject(err); });
            }
            else
                def.reject('notexists');
        }, function (err) { return def.reject(err); });
        return def.promise;
    };
    VideoManager.prototype.getNextVideo = function () {
        var def = Q.defer();
        var db = new dbDriver_1.DBDriver(null);
        var sql = "SELECT * FROM process WHERE status='newvideo'";
        db.queryAll(sql).done(function (res) {
            var out;
            for (var i = 0, n = res.length; i < n; i++) {
                var asset = res[i];
                if (fs.existsSync(WWW + '/' + asset.path)) {
                    out = asset;
                    break;
                }
                else
                    db.deleteById(asset.id, 'process');
            }
            if (out) {
                db.updateRow({ id: out.id, status: 'requested' }, 'process');
            }
            def.resolve(out);
        }, function (err) { return def.reject(err); });
        return def.promise;
    };
    return VideoManager;
}());
exports.VideoManager = VideoManager;
//# sourceMappingURL=VideoManager.js.map