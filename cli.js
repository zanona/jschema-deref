#!/usr/bin/env node
var run = require('./'),
    path = require('path'),
    src = process.argv.splice(2)[0];

src = path.resolve(src);
console.log(JSON.stringify(run(src), null, 2));
