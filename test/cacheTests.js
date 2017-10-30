'use strict'

const Cache = require('../cache/cache')

module.exports = {
    testCache
}


function testCache(test) {
    console.log('Testing cache')
    const cache = new Cache()
    cache.put(0,'First Value')
    test.equal(cache.get(0), 'First Value')
    console.log('Inserted first value in cache ')
    cache.put(1,'Second Value')
    test.equal(cache.count(),2)
    console.log('Inserted second value in cache ')
    console.log('Cache has two elements')
    cache.put(0,'Try first again')
    test.equal(cache.count(),2)
    test.equal(cache.get(0),'Try first again')
    console.log('Cache updated first value ')
    test.done()
}
