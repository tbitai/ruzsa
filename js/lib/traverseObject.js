/**
 * Traverse an object's (property, value) pairs.
 * @param callback - Callback that will be called like this: `callback(property, value)`.
 */
function traverseObject(o, callback) {
    for (var p in o) {
        if (o.hasOwnProperty(p)) {
            callback(p, o[p]);
            if (o[p] !== null && typeof(o[p]) == 'object') {
                traverseObject(o[p], callback);
            }
        }
    }
}

export default traverseObject;
