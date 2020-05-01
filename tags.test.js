const tagUtil = require('./tags');

describe('cmpTags', () => {
    for (tags of [[
        'foo-1.11.0',
        'zz',
        '0.123123123123123123123',
        '1.2.1.1',
        '1.11.0a2',
        '1.11.0rc1',
        '1.11.0',
        '1.11.0-1',
        '1.11.0.1',
        '2.2.0b1',
        '100',
    ], [
        'v1.3',
        '1.2b1',
        '1.2',
        '1.2-1',
        '1.11',
    ]]) {
        for (let i = 0; i < tags.length; ++i) {
            for (let j = 0; j < tags.length; ++j) {
                const [a, b] = [tags[i], tags[j]]
                if (i < j) {
                    test(`${a} < ${b}`, () => {
                        expect(tagUtil.cmpTags(a, b)).toBeLessThan(0);
                    })
                } else if (i > j) {
                    test(`${a} > ${b}`, () => {
                        expect(tagUtil.cmpTags(a, b)).toBeGreaterThan(0);
                    })
                } else {
                    test(`${a} = ${b}`, () => {
                        expect(tagUtil.cmpTags(a, b)).toBe(0);
                    })
                }
            }
        }
    }
})
