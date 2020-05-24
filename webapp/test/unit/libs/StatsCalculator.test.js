const StatsCalculator = require('../../../libs/StatsCalculator')
const trashItems = require('../model/wasteItemsTest')

beforeAll(async () => {
    'use strict'
});

test('Totals by type contain 7 waste types', () => {
    'use strict'
    expect(StatsCalculator.calculateTotalsByType(trashItems.wasteItems).length).toEqual(7)
})

test('Totals by month contain 2 month', () => {
    'use strict'
    expect(StatsCalculator.calculateTotalsByMonth(trashItems.wasteItems).length).toEqual(2)
})

describe('Totals by type and month', () => {
    'use strict'
    const totalsMap = StatsCalculator.calculateTotalsByMonthAndType(trashItems.wasteItems)

    test('Contains seven entries', () => {
        expect(totalsMap.size).toEqual(7)
    })

    test('Each type contains two entries', () => {
        totalsMap.forEach((value, key, map) => {
            expect(value.length).toEqual(2)
        })
    })
})