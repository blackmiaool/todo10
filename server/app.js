const Koa = require("koa");
const app = new Koa();
const Router = require("koa-router");
const views = require("koa-views");
const co = require("co");
const convert = require("koa-convert");
const json = require("koa-json");
const onerror = require("koa-onerror");
const bodyparser = require("koa-bodyparser")();
const logger = require("koa-logger");
const send = require("koa-send");
const db = require("./db.js");
const router = new Router();
const socket = require("./socket");
const config = require("../config.js");
const fs = require("fs");
const cors = require("kcors");

import { registerCheck } from "../common/check.js";
// middlewares
app.use(convert(bodyparser));
app.use(convert(json()));
app.use(convert(logger()));
app.use(cors());
app.use(convert(require("koa-static")(__dirname + "/public")));

var avatar = require("./avatar-generator")({
    order: "background face clothes head hair eye mouth".split(" ") //order in which
});

router.post("/avatar", async (ctx, next) => {
    await new Promise(function(resolve) {
        avatar(Math.random() + "", "male", 50).toBuffer(function(err, buffer) {
            ctx.body = `data:image/png;base64,` + buffer.toString("base64");
            ctx.status = 200;
            resolve();
        });
    });
});

function getFileName(name) {
    return name.replace(/^[\.\/]+/, "").replace(/^[\.]+/, "");
}
router.get("/getFile", async (ctx, next) => {
    const queryName = getFileName(ctx.request.query.name);
    const shortName = queryName.replace(/^\d+-/, "");
    ctx.body = fs.createReadStream(__dirname + "/public/files/" + queryName);
    ctx.attachment(shortName);
});
router.get("/getCode", async (ctx, next) => {
    const name = getFileName(ctx.request.query.name);
    if (!name.match(/^[\w\.]+$/)) {
        ctx.status = 400;
        return;
    }
    ctx.body = fs.createReadStream(__dirname + "/public/code/" + name);
});
router.post("/login", async (ctx, next) => {
    const name = ctx.request.body.name;
    const password = ctx.request.body.password;
    const checkResult = registerCheck("server", name, password);
    if (checkResult) {
        checkResult.code = 1;
        ctx.body = checkResult;
    } else {
        const result = await db.login(name, password);
        if (!result) {
            ctx.body = {
                code: 0,
                msg: "ok",
                data: {
                    name: name,
                    avatar: "/static/img/avatar.gif",
                    rooms: []
                }
            };
        } else if (result === true) {
            ctx.body = {
                code: 3,
                msg: "Wrong password"
            };
        } else {
            ctx.body = {
                code: 2,
                msg: "Fail to access db"
            };
        }
    }

    ctx.status = 200;
});
router.post("/register", async (ctx, next) => {
    const name = ctx.request.body.name;
    const password = ctx.request.body.password;
    const avatar = ctx.request.body.avatar;
    const checkResult = registerCheck("server", name, password);
    if (checkResult) {
        checkResult.code = 1;
        ctx.body = checkResult;
    } else {
        const buf = Buffer.from(avatar.slice(22), "base64");
        const avatarSrc =
            "//" + config.domain + `:${config.serverPort}/avatar/${name}.png`; //TODO must use config file to determine domain
        console.log(avatarSrc, "avatarSrc");

        const result = await db.register(name, password, avatarSrc);
        if (!result) {
            fs.writeFileSync(__dirname + `/public/avatar/${name}.png`, buf);
            ctx.body = {
                code: 0,
                msg: "ok"
            };
        } else {
            if (result.code === "SQLITE_CONSTRAINT") {
                ctx.body = {
                    code: 3,
                    key: "name",
                    msg: "Username exists"
                };
            } else {
                ctx.body = {
                    code: 2,
                    msg: "Fail to write into db"
                };
            }
        }
    }

    ctx.status = 200;
});
function serveDirectory(dir) {
    router.get(`/${dir}/*`, async ctx => {
        await send(ctx, ctx.path, {
            root: __dirname + "/public"
        });
    });
}
serveDirectory("code");
serveDirectory("files");
serveDirectory("avatar");
serveDirectory("images");
router.get(`/`, async ctx => {
    await send(ctx, ctx.path, {
        root: __dirname + "/../dist/",
        index: "index.html"
    });
});
router.get(`/static/*`, async ctx => {
    await send(ctx, ctx.path, {
        root: __dirname + "/../dist/",
        index: "index.html"
    });
});

app.use(async (ctx, next) => {
    ctx.set("Access-Control-Allow-Origin", "*");
    await next();
});

app.use(router.routes()).use(router.allowedMethods());
// response

app.on("error", function(err, ctx) {
    console.log(err);
    //    logger.error('server error', err, ctx);
});

console.log(new Date().toLocaleTimeString(), `listen on ${config.serverPort}`);
var server = require("http").createServer(app.callback());
var io = require("socket.io")(server);
socket.init(io);
server.listen(80);
module.exports = app;
