'use strict';

angular.module('TimeseriesAnalysationTool', []);

'use strict';

angular.module('TimeseriesAnalysationTool')
    .directive('threeDimChart', function (DividingService, AggregatingService, TimeseriesUtil, $timeout, $filter) {

        return {
            templateUrl: 'app/chart/three-dim-chart.html',
            restrict: 'E',
            scope: {
                externData: '=data'
            },
            link: function (scope) {

                scope.formatNumber = function(num) {
                    return $filter('number')(num, 2);
                };

                scope.range = [0.0, 1.0];
                scope.currentMin = scope.range[0];
                scope.currentMax = scope.range[1];

                scope.possibleColorscales = [
                    'Greys', 'YIGnBu', 'Greens', 'YIOrRd', 'Bluered', 'RdBu', 'Reds', 'Blues', 'Picnic', 'Rainbow', 'Portland', 'Jet', 'Hot'
                    , 'Blackbody', 'Earth', 'Electric', 'Viridis'
                ];

                scope.possibleResolutions = DividingService.possibleResolutions;
                scope.possibleAggregations = AggregatingService.possibleAggregations;

                var LAYOUT = {
                    title: null,
                    autosize: false,
                    width: $(document).width() / 2,
                    height: $(document).width() / 2,
                    margin: {
                        l: 65,
                        r: 50,
                        b: 65,
                        t: 90
                    },
                    scene: {
                        zaxis: {
                            title: 'Wert'
                        },
                        yaxis: {},
                        xaxis: {}
                    }
                };

                scope.$watch('externData', function (newData) {

                    if (!newData) {
                        return;
                    }

                    if (newData.type === 'function') {

                        if (!angular.isString(newData.specs.funcTerm)) {
                            throw 'Expected an String in specs.values but didn\'t find it!';
                        }

                        // Create DOM elements before function calculation freezes the webpage.
                        $timeout(function() {
                            scope.rawData = convertFromFunctionExpression(newData);
                            scope.timeseries = TimeseriesUtil.newTimeseries(newData.specs.startDate, newData.specs.stepLength, scope.rawData);
                        });


                    } else if (newData.type === 'array') {

                        if (!angular.isArray(newData.specs.values)) {
                            throw 'Expected an array in specs.values but didn\'t find it!';
                        }

                        scope.rawData = newData.specs.values;
                        scope.timeseries = TimeseriesUtil.newTimeseries(newData.specs.startDate, newData.specs.stepLength, scope.rawData);
                    } else {
                        throw 'Unrecognized data type!';
                    }

                    scope.range[0] = Math.min.apply(Math, scope.rawData);
                    scope.range[1] = Math.max.apply(Math, scope.rawData);

                    scope.currentMin = scope.range[0];
                    scope.currentMax = scope.range[1];

                    scope.options = {
                        yaxis: scope.possibleResolutions[0].text
                    };
                });

                scope.$watch('options', function (newOpt, oldOpt) {

                    var resY = undefined, agg = undefined, resX = undefined;

                    // options and values must be set
                    if (!newOpt) {
                        return;
                    }

                    // reset timeseries every time 'scope.options' changes
                    scope.timeseries = TimeseriesUtil.newTimeseries(scope.externData.specs.startDate, scope.externData.specs.stepLength, scope.rawData);
                    resetAxes();

                    if (oldOpt && newOpt.yaxis !== oldOpt.yaxis) {
                        newOpt.xaxis = null;
                    }
                    if (newOpt.yaxis) {
                        for (var i = 0; i < scope.possibleResolutions.length; i++) {
                            if (scope.possibleResolutions[i].text === newOpt.yaxis) {
                                resY = scope.possibleResolutions[i];
                            }
                        }
                    }
                    if (newOpt.xaxis && newOpt.agg) {

                        // get aggregation type
                        for (i = 0; i < scope.possibleAggregations.length; i++) {
                            if (scope.possibleAggregations[i].text === newOpt.agg) {
                                agg = scope.possibleAggregations[i];
                            }
                        }

                        // get xaxis resolution
                        for (i = 0; i < scope.possibleResolutions.length; i++) {
                            if (scope.possibleResolutions[i].text === newOpt.xaxis) {
                                resX = scope.possibleResolutions[i];
                            }
                        }
                    }

                    if (resY && resX && agg) {

                        TimeseriesUtil.divide(scope.timeseries, resY.calc);
                        TimeseriesUtil.divide(scope.timeseries, resX.calc);
                        TimeseriesUtil.aggregate(scope.timeseries, agg.calc);

                        LAYOUT.scene.xaxis.title = resX.text + ' ' + scope.options.agg;
                        LAYOUT.scene.yaxis.title = resY.text;
                    } else if (resY) {
                        TimeseriesUtil.divide(scope.timeseries, resY.calc, resY);
                        var res = selectMostFittingResolution(scope.timeseries);

                        LAYOUT.scene.yaxis.title = resY.text;
                        LAYOUT.scene.xaxis.title = '1 \u2261 ' + scope.timeseries.stepLength / res.value + ' ' + res.text;

                        if (resY.text === 'Original') {
                            LAYOUT.scene.yaxis.title = resY.text + ' \u2261 ' + scope.timeseries.stepLength / res.value + ' ' + res.text;
                        }
                    }

                    scope.refresh();
                }, true);

                function selectMostFittingResolution(timeseries) {

                    var i = 1; // skip original
                    while (scope.possibleResolutions[i].value <= timeseries.stepLength) {
                        i++;
                    }
                    i--;

                    return scope.possibleResolutions[i];
                }

                function convertFromFunctionExpression (surface) {

                    var data = [];
                    for (var x = 0; x < surface.specs.count; x++) {
                        data.push(eval(surface.specs.funcTerm));
                    }
                    return data;
                }

                scope.refresh = function () {
                    Plotly.newPlot('plotly', [{
                        z: TimeseriesUtil.getRenderableValues(scope.timeseries),
                        type: 'surface'
                    }], LAYOUT);
                };

                scope.getYAxisResolutionIndex = function () {
                    if (!scope.options || !scope.options.yaxis) {
                        return -1;
                    }

                    for (var i = 0; i < scope.possibleResolutions.length; i++) {
                        if (scope.possibleResolutions[i].text === scope.options.yaxis) {
                            return i;
                        }
                    }
                };

                function resetAxes() {
                    LAYOUT.scene.yaxis.title = LAYOUT.scene.xaxis.title = '';
                }

                scope.setMin = function (min) {
                    try {
                        Plotly.restyle('plotly', {cmin: min});
                    } catch (e) {
                        console.log('Plotly wurde noch nicht initialisiert.');
                    }
                };

                scope.setMax = function (max) {
                    try {
                        Plotly.restyle('plotly', {cmax: max});
                    } catch (e) {
                        console.log('Plotly wurde noch nicht initialisiert.');
                    }
                };

                scope.setColorscale = function (name) {
                    try {
                        Plotly.restyle('plotly', {colorscale: name});
                    } catch (e) {
                        console.log('Plotly wurde noch nicht initialisiert.');
                    }
                };
            }
        };
    });

angular.module('TimeseriesAnalysationTool').run(['$templateCache', function($templateCache) {$templateCache.put('app/chart/three-dim-chart.html','<div class="row">\n    <div id="plotly" class="col-md-6"></div>\n    <div class="col-md-2 col-md-offset-2">\n        <div class="form-group">\n            <label for="sel1">Y-Achsen Aufl\xF6sung:</label>\n            <select class="form-control" id="sel1" ng-model="options.yaxis">\n                <option ng-repeat="res in possibleResolutions" ng-disabled="timeseries.stepLength > res.value && res.value"\n                        ng-value="res.text">{{res.text}}</option>\n            </select>\n        </div>\n        <div class="form-group">\n            <label for="sel2">X-Achsen Aggregation:</label>\n            <select class="form-control" id="sel2" ng-model="options.xaxis">\n                <option ng-repeat="res in possibleResolutions" ng-disabled="timeseries.stepLength > res.value || $index > getYAxisResolutionIndex()"\n                        ng-value="res.text">{{res.text}}</option>\n            </select>\n        </div>\n        <div class="form-group">\n            <label for="sel3">Aggregationstyp:</label>\n            <select class="form-control" id="sel3" ng-model="options.agg" ng-disabled="!options.xaxis">\n                <option ng-repeat="agg in possibleAggregations">{{agg.text}}</option>\n            </select>\n        </div>\n        <hr>\n        <div class="form-group">\n            <label for="color">Farbskala:</label>\n            <select class="form-control" id="color" ng-model="color" ng-change="setColorscale(color)">\n                <option ng-repeat="c in possibleColorscales">{{c}}</option>\n            </select>\n        </div>\n\n        <div>\n            <label for="slider1" >Minimum: <i style="font-weight: normal">{{formatNumber(currentMin)}}</i>\n                <input id="slider1" type="range" min="{{range[0]}}" max="{{currentMax}}" step="{{(currentMax - range[0]) / 100}}"\n                       ng-model="currentMin"\n                       style="width:300px"\n                       ng-change="setMin(currentMin)">\n            </label>\n\n            <label for="slider2">Maximum: <i style="font-weight: normal">{{formatNumber(currentMax)}}</i>\n                <input id="slider2" type="range" min="{{currentMin}}" max="{{range[1]}}" step="{{(range[1] - currentMin) / 100}}"\n                       ng-model="currentMax"\n                       style="width:300px"\n                       ng-change="setMax(currentMax)">\n            </label>\n        </div>\n    </div>\n</div>\n\n\n\n');}]);
'use strict';

/**
 * This service provides aggregate functions for the Timeseries class.
 * Each of these functions work on a sub-array of a Timeseries object.
 * Provided functions are:
 *  - sum
 *  - avg
 *  - max
 *  - min
 */
angular.module('TimeseriesAnalysationTool').service('AggregatingService', function () {

    /**
     * Sums all values in one interval up.
     *
     * @param values - [number] values of a sub-array of a Timeseries object.
     * @returns number
     */
    this.sum = function (values) {
        return values.reduce(function (prev, curValue) {
            return prev + curValue;
        });
    };

    var sum = this.sum;

    /**
     * Builds the average of all values in one interval.
     * Uses the sum function.
     *
     * @param values - [number] values of a sub-array of a Timeseries object.
     * @returns number
     */
    this.avg = function (values) {

        return sum(values) / values.length;
    };

    /**
     * Determines the maximal element in each interval.
     *
     * @param values - [number] values of a sub-array of a Timeseries object.
     * @returns number
     */
    this.max = function (values) {

        var max = values[0];
        for (var i = 0; i < values.length; i++) {
            if (values[i] > max) {
                max = values[i];
            }
        }
        return max;
    };

    /**
     * Determines the minimal element in each interval.
     *
     * @param values - [number] values of a sub-array of a Timeseries object.
     * @returns number
     */
    this.min = function (values) {
        var min = values[0];
        for (var i = 0; i < values.length; i++) {
            if (values[i] < min) {
                min = values[i];
            }
        }

        return min;
    };

    var self = this;

    this.possibleAggregations = [
        {
            text: 'Summe',
            calc: self.sum
        }, {
            text: 'Durchschnitt',
            calc: self.avg
        }, {
            text: 'Maximum',
            calc: self.max
        }, {
            text: 'Minimum',
            calc: self.min
        }
    ];

    return this;

})
;
'use strict';

/**
 * This service provides diving functions for manipulating timeseries.
 */
angular.module('TimeseriesAnalysationTool').service('DividingService', function () {


    /*
     Nothing smaller then milli seconds are supported.
     */
    var secInMSec = 1000;
    var minuteInMSec = 60 * secInMSec;
    var hourInMSec = 60 * minuteInMSec;
    var dayInMSec = 24 * hourInMSec;
    var weekInMSec = 7 * dayInMSec;

    var self = this;

    function cutInSameSize(values, interval, offset) {
        var result = [];

        result.push(values.slice(0, interval - offset));
        for (var k = interval - offset; k < values.length; k += interval) {
            /*
             If the last slice is smaller then interval we need a different logic.
             Right now the last slice will be saved as well.
             Alternatively we could add interpolated values or cut it completely.
             */
            if (k + interval <= values.length) {
                result.push(values.slice(k , k + interval ));
            } else {
                result.push(values.slice(k));
            }

        }
        return result;
    }

    this.fillValues = function (values, stepLength, msec, fillValue) {
        var diff = msec / stepLength - values[0].length;
        if (diff != 0) {
            for (var i = 0; i < diff; i++) {
                values[0].push(fillValue);
            }
        }

        diff = msec / stepLength - values[values.length - 1].length;
        if (diff != 0) {
            for (i = 0; i < diff; i++) {
                values[values.length - 1].push(fillValue);
            }
        }

        if (values.length === 1) {
            return [values[0], values[0]];
        }

        return values;
    };

    this.getSeconds = function (values, stepLength, startdate) {
        var offset = startdate.getTime() % secInMSec;

        if (!angular.isArray(values)) {
            return [values];
        }

        return cutInSameSize(values, secInMSec / stepLength, offset);
    };

    this.getMinutes = function (values, stepLength, startdate) {
        var offset = startdate.getTime() % minuteInMSec;
        console.log(values, offset, minuteInMSec / stepLength);

        if (!angular.isArray(values)) {
            return [values];
        }

        return cutInSameSize(values, minuteInMSec / stepLength, offset);
    };

    this.getHours = function (values, stepLength, startdate) {
        var offset = startdate.getTime() % hourInMSec;

        if (!angular.isArray(values)) {
            return [values];
        }

        return cutInSameSize(values, hourInMSec / stepLength, offset);
    };

    this.getDays = function (values, stepLength, startdate) {
        var offset = startdate.getTime() % dayInMSec;

        return cutInSameSize(values, dayInMSec / stepLength, offset);
    };

    this.getWeeks = function (values, stepLength, startdate) {
        var offset = startdate.getTime() % weekInMSec;

        return cutInSameSize(values, weekInMSec / stepLength, offset);
    };


    this.possibleResolutions = [{
        text: 'Original',
        value: null,
        calc: function (values) {
            return _.map(values, function(i) {
                return [i];
            });
        }
    }, {
        text: 'Sekunde/n',
        value: secInMSec,
        calc: self.getSeconds
    }, {
        text: 'Minute/n',
        value: minuteInMSec,
        calc: self.getMinutes
    }, {
        text: 'Stunde/n',
        value: hourInMSec,
        calc: self.getHours
    }, {
        text: 'Tag/e',
        value: dayInMSec,
        calc: self.getDays
    }, {
        text: 'Woche/n',
        value: weekInMSec,
        calc: self.getWeeks
    }];

    return this;
});
angular.module('TimeseriesAnalysationTool').service('TimeseriesUtil', function () {

    var self = this;
    this.newTimeseries = function(startDate, stepLength, values) {

        return {
            startDate: startDate,
            stepLength: stepLength,
            values: values,
            depth: 2
        };
    };


    /**
     * Cuts the most inner sub-arrays in parts by a
     * self defined function which works on all most inner sub-arrays.
     *
     * @param timeseries
     * @param divFunc
     */
    this.divide = function (timeseries, divFunc) {

        var temp = this.funcMostInnerArrays(timeseries.values, timeseries.values, divFunc, 0, false, timeseries);
        if (angular.isDefined(temp)) {
            timeseries.depth++;
            timeseries.values = temp;
        }

    };


    this.getRenderableValues = function (timeseries) {
        if (timeseries.values && timeseries.values[0].length === 1) {

            var copy = angular.copy(timeseries.values);
            for (var i = 0; i < timeseries.values.length; i++) {
                copy[i].push(copy[i][0]);
            }

            return copy;
        } else if (timeseries.values && timeseries.values.length === 1) {
            copy = angular.copy(timeseries.values);
            copy.push(copy[0]);

            return copy;
        }

        return timeseries.values;

    };

    /**
     * Aggregates a timeseries by aggregating every most inner sub-array.
     *
     * The AggregatingService provides pre defined functions.
     *
     */
    this.aggregate = function (timeseries, aggFunc) {

        var temp = this.funcMostInnerArrays(timeseries.values, timeseries.values, aggFunc, 0, true, timeseries);
        if (angular.isDefined(temp)) {
            timeseries.depth--;
            timeseries.values = temp;
        }
    };

    /**
     * This function searches for the most inner arrays and uses the func on this array.
     * then this array will be replaces with the result of the func. It should work with
     * the dividing functions as well as long as they return an array like this: [[],[], ...].
     *
     * @param parent - parent array reference to replace the array.
     * @param arr - current array being processed.
     * @param func - func to use on most inner arrays.
     * @param i - index of the sub-array in the parent array; for replacing.
     * @param isAgg - boolean whether func is an aggFunc or not.
     * @param timeseries - timeseries object.
     *
     * @return if inner array is outer array return value.
     */
    this.funcMostInnerArrays = function (parent, arr, func, i, isAgg, timeseries) {
        if (angular.isArray(arr) && !angular.isArray(arr[0])) { //found most inner array

            var oldStep = timeseries.stepLength;
            if (isAgg) {
                timeseries.stepLength *= arr.length;
            }

            if (parent === arr) {
                return func(arr, oldStep, timeseries.startDate);
            }
            parent[i] = func(arr, oldStep, timeseries.startDate);

        } else {
            for (var t = 0; t < arr.length; t++) {
                this.funcMostInnerArrays(arr, arr[t], func, t, isAgg, timeseries);
            }
        }
    };

    return this;
});