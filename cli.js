#!/usr/bin/env node
var run = require('./'),
    path = require('path'),
    src = process.argv.splice(2)[0];

src = path.resolve(src);
process.stdout.write(JSON.stringify(run(src), null, 2));
