function compareObjects(obj, ref) {
    // Note that this works only if the order of the properties is the same.
    return JSON.stringify(obj) === JSON.stringify(ref);
}

export default compareObjects;

