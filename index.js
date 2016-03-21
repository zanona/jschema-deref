module.exports = function (src) {

    var read    = require('fs').readFileSync,
        path    = require('path'),
        yaml    = require('js-yaml'),
        lodash  = require('lodash'),
        processDir = path.dirname(process.argv[1]) || './',
        srcPath,
        mainDoc;

    //User source related to where the script is called
    src = path.resolve(processDir, src);
    //Set path for external $refs related to source directory
    srcPath = path.dirname(src);

    function parseRef(ref) {
        var f, d;
        ref = ref.split(/\/?#\/?/);
        if (ref[0]) {
            f = srcPath + '/' + ref[0];
            f = path.normalize(f);
            f = yaml.safeLoad(read(f));
            return f;
        } else {
            d = mainDoc;
            f = ref[1].split('/');
            f.forEach(function (k) { d = d[k]; });
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
                p = loadProps(parseRef(p));
                doc = lodash.mergeWith(doc, p, lodashCustomizer);
                delete doc.$ref;
            }
        });
        return doc;
    }

    mainDoc = yaml.safeLoad(read(src));
    return loadProps(mainDoc);
};
