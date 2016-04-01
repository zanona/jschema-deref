var read    = require('fs').readFileSync,
    path    = require('path'),
    yaml    = require('js-yaml'),
    lodash  = require('lodash'),
    processDir = path.dirname(process.argv[1]) || './',
    cache = {};

function init(src) {
    var srcPath,
        mainDoc;

    //User source related to where the script is called
    src = path.resolve(processDir, src);
    //Set path for external $refs related to source directory
    srcPath = path.dirname(src);

    function parseRef(ref, obj) {
        var f,
            d,
            paths = ref.split(/\/?#\/?/);
        if (paths[0]) {
            f = srcPath + '/' + paths[0];
            f = path.normalize(f);
            try {
                if (!cache[f]) {
                    cache[f] = init(f);
                }
                ref = ref.replace(paths[0], '');
                return parseRef(ref, cache[f]);
            } catch (e) {
                throw new Error('Cannot find reference ' + ref);
            }
        } else {
            d = obj;
            f = paths[1].split('/');
            try {
                f.forEach(function (k) { d = d[k]; });
            } catch (e) {
                throw new Error('Cannot find reference: ' + ref);
            }
            return d;
        }
    }
    function lodashCustomizer (objValue, srcValue) {
        if (lodash.isArray(objValue)) {
            return objValue.concat(srcValue);
        }
    }
    function loadProps(doc) {
        Object.keys(doc).forEach(function (key) {
            var p = doc[key],
                type = p && p.constructor.name;
            if (p === null) { return; }
            if (type === 'Array') { return p.forEach(loadProps); }
            if (type === 'Object') { return loadProps(p); }
            if (key === '$ref') {
                p = loadProps(parseRef(p, mainDoc));
                doc = lodash.mergeWith(doc, p, lodashCustomizer);
                delete doc.$ref;
            }
        });
        return doc;
    }

    mainDoc = yaml.safeLoad(read(src));
    return loadProps(mainDoc);
}

module.exports = init;
