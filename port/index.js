const context = require.context("./login", true, /^\.\/([\w-]+)\/client\.js$/);
const keys = context.keys();
const login = keys.map(context);
login.forEach((v, i) => {
    v.name = keys[i].match(/(\w+)\/(\w+)\.js$/)[1];
});
module.exports = {
    login
};
