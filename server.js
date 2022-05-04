const http = require('http');const fs = require('fs');
const { normalize } = require('path');
const wwwRoot = normalize(__dirname + "/www");

const PORT = 80;

http.createServer (function(req, res) {
    var body = '';
    req.on('data', function (data) {body += data;});
    req.on('end', function () {
        var ipAddress=req.connection.remoteAddress;
        var query = req.url.split("?");
        var url = query[0];
        var params = {};
        if(query.length>1) params = parseParams(query[1]);
        switch(req.method){
            default: sendResponse(405, "Method Not Allowed"); break;
            case "GET": handleGet(url, params, sendResponse); break;
            //case "POST": apiHandler(url, params, body, sendResponse); break;
        }

        function sendResponse(statusCode, responseBody, contentType){
            console.log(ipAddress, req.method, url, statusCode);
            res.writeHead(statusCode, {'Content-Type': contentType ? contentType : "text/plain"});
            res.end(responseBody);
        }
    });
}).listen(PORT, "0.0.0.0");
console.log("GUI Server running on port " + PORT + " - press Ctrl+C to exit");



function parseParams(queryParams){
    var result = {};
    queryParams=queryParams.split("&");
    for(var i=0; i<queryParams.length; i++){
        var keyValue = queryParams[i].split("=");
        var key = keyValue[0];
        if(keyValue.length>1){
            result[key] = formatValue(keyValue[1]);
        }else{
            result[key] = true;
        }
    }
    return result;
}



function formatValue(value){
    if(value=="true") return true;
    if(value=="false") return false;
    if(Number(value)==value) return Number(value);
    return value;
}


function handleGet(url, params, callback){
    //console.log(url, params);
    var file = getFileOrIndex(url);

    if(file){
        callback(200, file.data, file.contentType);
    }else{
        callback(404, "Not Found");
    }
}


function validateFilePath(filename){
    var requestedFile = wwwRoot + filename;
    try{
        var realPath = fs.realpathSync(requestedFile);
    }catch(e){
        return false;
    }

    if(realPath.substring(0, wwwRoot.length) != wwwRoot) return false;

    return true;
}


function getFileOrIndex(filename){
    if(!validateFilePath(filename)) return null;

    var fileAndDetails = getFileAndDetails(filename);
    if(fileAndDetails) return fileAndDetails;

    return getFileAndDetails(filename + "index.html");
}


function getFileAndDetails(filename){
    var ext = filename.split(".");
    ext = ext[ext.length-1];
    try{
        data = fs.readFileSync(wwwRoot + filename);
    }catch(e){
        return null;
    }
    if(!data) return null;
    return { data, ext, contentType : getContentType(ext) };
}


function getContentType(ext){
    if(!ext) return "text/plain";
    ext = ext.toLowerCase();
    switch(ext){
        default : return "text/plain";
        case "css" : return "text/css";
        case "js" : return "text/javascript";
        case "html" : return "text/html";
        case "png" : return "image/png";
        case "gif" : return "image/gif";
        case "jpeg" : case "jpg" : return "image/jpeg";
        case "svg" : return "image/svg+xml";
    }
}