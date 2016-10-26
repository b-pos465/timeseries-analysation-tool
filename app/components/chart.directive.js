'use strict';

angular.module('myApp')
    .directive('chart', function (DataConverter, DefaultTimeseriesDefinition, DividingService, AggregatingService, TimeseriesUtil, $timeout, $filter) {

        return {
            templateUrl: 'app/components/chart.html',
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

                    console.log('Externe Daten:', newData);
                    if (newData.type === 'function') {

                        if (!angular.isString(newData.specs.funcTerm)) {
                            throw 'Expected an String in specs.values but didn\'t find it!';
                        }

                        // Create DOM elements before function calculation freezes the webpage.
                        $timeout(function() {
                            DataConverter.fromFunctionExpression(newData);
                            scope.rawData = DataConverter.fromFunctionExpression(newData);
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
                });

                scope.$watch('options', function (newOpt, oldOpt) {

                    console.log(newOpt);
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

                    console.log(scope.timeseries.values);
                    console.log(resY, agg, resX);

                    if (resY && resX && agg) {

                        TimeseriesUtil.divide(scope.timeseries, resY.calc);
                        console.log(angular.copy(scope.timeseries.values));
                        TimeseriesUtil.divide(scope.timeseries, resX.calc);
                        console.log(scope.timeseries.values);
                        TimeseriesUtil.aggregate(scope.timeseries, agg.calc);
                        console.log(scope.timeseries.values);

                        LAYOUT.scene.xaxis.title = resX.text + ' ' + scope.options.agg;
                        LAYOUT.scene.yaxis.title = resY.text;
                    } else if (resY) {
                        TimeseriesUtil.divide(scope.timeseries, resY.calc, resY);
                        console.log(scope.timeseries.values);
                        console.log(LAYOUT.scene.yaxis.title);
                        LAYOUT.scene.yaxis.title = resY.text;
                        console.log(LAYOUT.scene.yaxis.title);

                        var res = selectMostFittingResolution(scope.timeseries);
                        LAYOUT.scene.xaxis.title = '1 \u2261 ' + scope.timeseries.stepLength / res.value + ' ' + res.text;
                        console.log(angular.copy(LAYOUT));
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

                scope.refresh = function () {

                    console.log(angular.copy(TimeseriesUtil.getRenderableValues(scope.timeseries)));

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
                    Plotly.restyle('plotly', {cmin: min});
                };

                scope.setMax = function (max) {
                    Plotly.restyle('plotly', {cmax: max});
                };

                scope.setColorscale = function (name) {
                    Plotly.restyle('plotly', {colorscale: name});
                };
            }
        };
    });
