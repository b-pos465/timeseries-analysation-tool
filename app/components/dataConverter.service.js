'use strict';

angular.module('myApp').service('DataConverterTo1D', function () {

    this.fromFunctionExpression = function (funcString, count) {

        var data = [];
        for (var x = 0; x < count; x++) {
            data.push(eval(funcString));
        }

        return data;
    };

    return this;
});