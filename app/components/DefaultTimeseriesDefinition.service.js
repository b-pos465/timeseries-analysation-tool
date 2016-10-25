'use strict';

angular.module('myApp').service('DefaultTimeseriesDefinition', function () {

    var count = 0;

    this.getDefaultFunctionBasedTimeseries = function () {

        count++;

        return {
            meta: {
                name: 'Default ' + count,
                active: true
            },
            dataDefinition: {
                type: 'function', // later maybe: or 1-D array with width, height or 2-D array with width, height.,
                specs: {
                    startdate: new Date('1970-01-01'),
                    funcTerm: 'x',
                    stepLength: 1000,
                    count: 18000
                }
            }
        }
    };

    //TODO other data input types

    return this;
});