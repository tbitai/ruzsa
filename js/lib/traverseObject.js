/**
 * Traverse an object's (subobject, property, value) triples.
 * @param callback - Callback that will be called like this: `callback(subobject, property, value)`.
 */
function traverseObject(o, callback) {
    for (var p in o) {
        if (o.hasOwnProperty(p)) {
            callback(o, p, o[p]);
            if (o[p] !== null && typeof(o[p]) == 'object') {
                traverseObject(o[p], callback);
            }
        }
    }
}

export default traverseObject;
