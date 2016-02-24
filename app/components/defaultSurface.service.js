'use strict';

angular.module('myApp').service('DefaultSurfaceService', function () {

    var count = 0;

    this.getDefaultTimeseriesWrapper = function () {

        count++;

        return {
            changeSelection: function(selecString) {
                this.options.analytics.xSelection = selecString;
            },
            meta: {
                name: 'Default ' + count,
                active: true
            },
            dataDefinition: {
                type: 'function', // later maybe: or 1-D array with width, height or 2-D array with width, height.,
                specs: {
                    startdate: new Date('1970-01-01'),
                    funcTerm: 'x',
                    interval: 200,
                    count: 1000
                }
            },
            options: {
                analytics: {
                    xSelection: 'original'
                }
            }
        }
    };

    return this;
});