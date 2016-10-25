'use strict';

angular.module('myApp').service('DefaultTimeseriesDefinition', function () {

    var count = 0;

    this.getDefaultFunctionBasedTimeseries = function () {

        count++;

        return {

            type: 'function', // later maybe: or 1-D array with width, height or 2-D array with width, height.,
            specs: {
                startDate: new Date('1970-01-01'),
                funcTerm: 'x',
                stepLength: 900000,
                count: 35040
            }
        }
    };

    //TODO other data input types

    return this;
});