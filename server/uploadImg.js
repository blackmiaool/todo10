const request = require('request');

function addParam(url, key, value) {
    url = url.replace(new RegExp(`[?&]${key}=[^&]*&?`, 'g'), (str) => str[str.length - 1] === "&" ? str[0] : "");
    let hashReg = /#[\w\-]+$/;
    let hash = url.match(hashReg) || [];
    hash = hash[0] || "";
    url = url.replace(hashReg, "");
    let linkSymbol = "&";
    if (url.indexOf("?") === -1) {
        linkSymbol = "?";
    }
    return `${url}${linkSymbol}${key}=${value}${hash}`
}

function transformSrc(src) {
    let w = src.match(/w=(\d+)/)[1] * 1;
    let h = src.match(/h=(\d+)/)[1] * 1;
    if (!w || !h) {
        return src;
    }
    if (w > 1080) {
        h = parseInt(h / w * 1080);
        w = 1080;
    }
    if (h > 3100) {
        w = parseInt(w / h * 3100);
        h = 3100;
    }
    src = addParam(src, "w", w);
    src = addParam(src, "h", h);
    if (src.match(/\.gif/)) {
        src += '&t=raw';
    }
    return src;
}

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
            const url = transformSrc(JSON.parse(body).result);
            resolve(url);
        });
    });
}
module.exports = {
    doUploadImage
}
