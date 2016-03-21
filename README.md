JSON Schema de-referencer
===

Expand `$ref`s on YAML files based JSON Schema.
Currently it works with local references and external local YAML files having a
single document only per file.

Installation:

    npm install zanona/jschema-deref -g
    jsderef swagger.yaml > swagger.json
