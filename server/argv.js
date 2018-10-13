var argv = require('yargs-parser')(process.argv.slice(2), {
    default: {
        port: 9016
    }
})

module.exports = argv;
