'use strict';

angular.module('myApp').service('DataConverter', function (Timeseries) {

    this.fromFunctionExpression = function (surface) {

        var data = [];
        for (var x = 0; x < surface.dataDefinition.specs.count; x++) {
            data.push(eval(surface.dataDefinition.specs.funcTerm));
        }

        Timeseries.set(surface.dataDefinition.specs.startdate, surface.dataDefinition.specs.stepLength, data);
    };

    return this;
});