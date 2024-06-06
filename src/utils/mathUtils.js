const clamp = (min, max, num) => Math.max(min, Math.min(num, max));

/**
 * Get an array with no duplicate entries. This can only handle primitives
 * and doesn't differentiate between numbers and strings
 * @param {any[]} a input array
 * @returns 
 */
function uniqueArray(a) {
    var seen = {};
    return a.filter(function(item) {
        return Object.prototype.hasOwnProperty.call(item) ? false : seen[item] = true;
    });
}

module.exports = { clamp, uniqueArray };
