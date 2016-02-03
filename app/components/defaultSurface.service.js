'use strict';

angular.module('myApp').service('DefaultSurfaceService', function () {

    var count = 0;

    this.getDefault = function () {

        count++;

        return {
            meta: {
                name: 'Default ' + count,
                active: true
            },
            dataDefinition: {
                type: 'function', // or 1-D array with width, height or 2-D array with width, height.,
                specs: {
                    funcTerm: '0.5 * x+ 0.5 * y - 10',
                    xCount: 20,
                    yCount: 10
                }
            },
            options: {
                analytics: {
                    showDailyAverage: false,
                    showYearlyAverage: false
                }
            }
        }
    };

    return this;

});