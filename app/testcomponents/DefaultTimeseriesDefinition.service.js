'use strict';

angular.module('TimeseriesAnalysationTool').service('DefaultTimeseriesDefinition', function ($http) {

    this.getDefaultFunctionBasedTimeseries = function () {
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

    this.getDefaultArrayBasedTimeseries = function () {

        return $http.get('app/testdata/timeseries.json').then(function(res) {
            var values = _.map(res.data['1'], function(item) {
                return item.avg;
            });

            return {
                type: 'array',
                specs: {
                    startDate: new Date('1970-01-01'),
                    values: values,
                    stepLength: 900000,
                    count: values.length
                }
            }
        });
    };

    return this;
});