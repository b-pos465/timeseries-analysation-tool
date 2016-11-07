'use strict';

angular.module('TimeseriesAnalysationTool').service('DefaultTimeseriesDefinition', function ($http) {

    this.getDefaultArrayBasedTimeseries = function () {

        return $http.get('app/testdata/timeseries.json').then(function (res) {
            var values = _.map(res.data['1'], function (item) {
                return item.avg;
            });

            return {
                startDate: new Date('1970-01-01'),
                values: values,
                stepLength: 900000
            }
        });
    };

    return this;
});