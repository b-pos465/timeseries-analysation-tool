'use strict';

angular.module('myApp').service('DataConverter', function () {

    this.fromFunctionExpression = function (surface) {

        var data = [];
        for (var x = 0; x < surface.specs.count; x++) {
            data.push(eval(surface.specs.funcTerm));
        }
        return data;
    };

    return this;
});