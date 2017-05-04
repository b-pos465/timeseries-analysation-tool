'use strict';

/**
 * This is the core of this project. It's the directive that can be used anywhere inside a AngularJS based web-application.
 * The usage of this component is described in the README.md.
 */
angular.module('TimeseriesAnalysationTool')
    .directive('threeDimChart', function (DividingService, AggregatingService, TimeseriesUtil, $timeout, $filter) {

        return {
            templateUrl: 'app/chart/ThreeDimChart.html',
            restrict: 'E',
            scope: {
                externData: '=data',
                externOptions: '=options'
            },
            link: function (scope) {

                /**
                 * This function is used to get the first to digits for a number.
                 *
                 * @param num Number.
                 * @returns {*} String with to digits.
                 */
                scope.formatNumber = function (num) {
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

                /*
                This is the basic layout for the plotlyJS graph.
                 */
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

                /**
                 * This watcher watches whether the externOptions object has changed.
                 */
                scope.$watch('externOptions', function(o) {
                    if (!o) {
                        //skip
                    } else if (scope.possibleColorscales.indexOf(o.initialcolorscale) !== -1) {
                        scope.color = scope.initialcolorscale = o.initialcolorscale;
                    } else {
                        throw 'Die Angabe für options.initialcolorscale ist nicht gültig!';
                    }
                    scope.change(o);
                });

                /**
                 * This watcher watches whether the externData object has changed.
                 */
                scope.$watch('externData', function (newData) {

                    if (!newData) {
                        return;
                    }else if (angular.isArray(newData.values)) {
                        for(var i = 0; i < newData.values.length; i++) {
                            if (!angular.isNumber(newData.values[i])) {
                                throw 'data.values muss ein 1-D Array aus numerischen Werten darstellen!';
                            }
                        }
                    } else {
                        throw 'data.values enthält kein Array!';
                    }

                    // one way binding; do not change the outer data
                    scope.timeseries = angular.copy(newData);

                    // recalculate max and min values
                    scope.range[0] = Math.min.apply(Math, scope.timeseries.values);
                    scope.range[1] = Math.max.apply(Math, scope.timeseries.values);

                    // reset range inputs
                    scope.currentMin = scope.range[0];
                    scope.currentMax = scope.range[1];

                    scope.options = {
                        yaxis: scope.possibleResolutions[0].text
                    };

                    scope.change(scope.options);
                }, true);

                /**
                 * Gets called after externData or externOptions has changed.
                 *
                 * @param newOpt New scope.options object.
                 */
                scope.change = function(newOpt) {
                    var resY = undefined, agg = undefined, resX = undefined;

                    // options must be set
                    if (!newOpt) {
                        return;
                    }

                    // reset timeseries every time 'scope.options' changes
                    scope.timeseries = angular.copy(scope.externData);

                    // reset axes label
                    resetAxes();

                    // get yaxis resolution
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

                    // either 2 divisions and 1 aggregation or just 1 division
                    if (resY && resX && agg) {

                        TimeseriesUtil.divide(scope.timeseries, resY.calc);
                        TimeseriesUtil.divide(scope.timeseries, resX.calc);
                        TimeseriesUtil.aggregate(scope.timeseries, agg.calc);

                        // set axes labels
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
                };

                scope.$watch('options', function (newOpt) {
                    scope.change(newOpt);
                }, true);

                /**
                 * Selects the best resolution for a timeseries. This is used to get a nice axis label.
                 *
                 * @param timeseries Timeseries object.
                 * @returns {*} Best resolution.
                 */
                function selectMostFittingResolution(timeseries) {

                    var i = 1; // skip original
                    while (scope.possibleResolutions[i].value <= timeseries.stepLength) {
                        i++;
                    }
                    i--;

                    return scope.possibleResolutions[i];
                }

                /**
                 * Resets the resolution selections.
                 */
                scope.resetSelection = function () {
                    scope.options.yaxis = 'Original';
                    scope.options.xaxis = undefined;
                    scope.options.agg = undefined;
                };

                /**
                 * Calculates min and max values for either a 1d array or a 2d array.
                 * @param values
                 */
                scope.calculateRange = function (values) {
                    if (angular.isArray(values[0])) {
                        var mins = [];
                        var maxs = [];

                        for (var i = 0; i < values.length; i++) {
                            mins.push(Math.min.apply(Math, values[i]));
                            maxs.push(Math.max.apply(Math, values[i]));
                        }

                        scope.range[0] = Math.min.apply(Math, mins);
                        scope.range[1] = Math.max.apply(Math, maxs);
                    } else {
                        scope.range[0] = Math.min.apply(Math, values);
                        scope.range[1] = Math.max.apply(Math, values);
                    }
                    scope.currentMin = scope.range[0];
                    scope.currentMax = scope.range[1];
                };

                /**
                 * Refreshes PlotlyJS
                 */
                scope.refresh = function () {
                    if (!scope.timeseries) {
                        return;
                    }

                    scope.calculateRange(scope.timeseries.values);

                    Plotly.newPlot('plotly', [{
                        z: TimeseriesUtil.getRenderableValues(scope.timeseries),
                        type: 'surface'
                    }], LAYOUT);

                    if (scope.color) {
                        scope.setColorscale(scope.color);
                    }
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
                    scope.color = name;
                    try {
                        Plotly.restyle('plotly', {colorscale: name});
                    } catch (e) {
                        console.log('Plotly wurde noch nicht initialisiert.');
                    }
                };
            }
        };
    });
