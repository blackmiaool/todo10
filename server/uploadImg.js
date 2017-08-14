const request = require('request');

function doUploadImage(stream, url) {
    let formData = {
        upload: {
            value: stream,
            options: {
                filename: `test.${url.match(/\w+$/)}`,
                contentType: `image/${url.match(/\w+$/)}`,
                name: "upload",
            }
        }
    };
    //    console.log(formData);
    return new Promise((resolve) => {
        request.post({
            url: 'http://support.io.mi.srv/shop/uploadpic',
            formData,
            headers: {
                "Accept-Language": "en,zh-CN;q=0.8,zh;q=0.6",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                //"Content-Type":multipart/form-data; boundary=----WebKitFormBoundaryLUio9LersMxXLcDU
                // Cookie: ck,
                Host: "support.io.mi.srv",
                Origin: "http://support.io.mi.srv",
                Pragma: "no-cache",
                Referer: "http://support.io.mi.srv/miot_editor/dist/index.html",
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.101 Safari/537.36",
            }
        }, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return console.error('upload failed:', err);
            }
            resolve(JSON.parse(body).result);
        });
    });
}
module.exports = {
    doUploadImage
}
