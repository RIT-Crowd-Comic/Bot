const { clamp } = require('../utils/mathUtils');

describe('clamp', () => {
    test('returns the number when it is within the range', () => {
        expect(clamp(1, 10, 5)).toBe(5);
    });

    test('returns the minimum when the number is less than the minimum', () => {
        expect(clamp(1, 10, 0)).toBe(1);
    });

    test('returns the maximum when the number is greater than the maximum', () => {
        expect(clamp(1, 10, 15)).toBe(10);
    });

    test('handles edge case where number is exactly the minimum', () => {
        expect(clamp(1, 10, 1)).toBe(1);
    });

    test('handles edge case where number is exactly the maximum', () => {
        expect(clamp(1, 10, 10)).toBe(10);
    });

    test('handles edge case where min and max are equal', () => {
        expect(clamp(1, 1, 5)).toBe(1);
    });
});

