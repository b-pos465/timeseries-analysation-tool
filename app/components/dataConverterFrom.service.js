'use strict';

angular.module('myApp').service('DataConverterFrom', function () {

    this.functionExpression = function (funcString, xCount, yCount) {

        var data = [];

        for (var y = 0; y < yCount; y++) {
            var temp = [];
            for (var x = 0; x < xCount; x++) {
                temp.push(eval(funcString));
            }
            data.push(temp);
        }

        return data;
    };


    return this;

});