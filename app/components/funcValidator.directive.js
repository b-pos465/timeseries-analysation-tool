'use strict';

angular.module('myApp')
    .directive('funcValidator', function () {

        return {
            template: '',
            restrict: 'A',
            require: 'ngModel',
            scope: { // Isolate scope

            },
            link: function (scope, ele, attrs, ngModel) {

                ngModel.$parsers.push(function(value) {

                    try {
                        var x = 0, y = 0;
                        eval(value);
                    } catch (e){
                        return undefined;
                    }

                    return value;
                });
            }
        };
    });
