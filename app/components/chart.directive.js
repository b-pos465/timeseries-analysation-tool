'use strict';

angular.module('myApp')
    .directive('chart', function (DataConverter, DefaultTimeseriesDefinition, DividingService, AggregatingService, Timeseries) {

        return {
            templateUrl: 'app/components/chart.html',
            restrict: 'E',
            scope: {},
            link: function (scope) {

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
                        }
                    }
                };

                scope.surface = DefaultTimeseriesDefinition.getDefaultFunctionBasedTimeseries();

                scope.options = {};

                function reset () {
                    LAYOUT.scene.yaxis = LAYOUT.scene.xaxis = {};
                }

                scope.$watch('options', function (newOpt) {

                    console.log(newOpt, Timeseries.SAVE)
                    if (!newOpt || !Timeseries.SAVE) {
                        return;
                    }

                    reset();

                    if (newOpt.yaxis) {
                        for(var i = 0; i < scope.possibleResolutions.length; i++) {
                            if (scope.possibleResolutions[i].text === newOpt.yaxis) {
                                var resY = scope.possibleResolutions[i];
                            }
                        }
                    }

                    if (newOpt.xaxis && newOpt.agg) {

                        // get aggregation type
                        for(i = 0; i < scope.possibleAggregations.length; i++) {
                            if (scope.possibleAggregations[i].text === newOpt.agg) {
                                var agg = scope.possibleAggregations[i];
                            }
                        }

                        // get xaxis resolution
                        for(i = 0; i < scope.possibleResolutions.length; i++) {
                            if (scope.possibleResolutions[i].text === newOpt.xaxis) {
                                var resX = scope.possibleResolutions[i];
                            }
                        }
                    }


                    Timeseries.reset();

                    if (resY && agg && resX) {
                        console.log(1);
                        Timeseries.divide(resY.calc);
                        console.log(angular.copy(Timeseries.values));
                        Timeseries.divide(resX.calc);
                        console.log(Timeseries.values);
                        Timeseries.aggregate(agg.calc);
                        console.log(Timeseries.values);

                        LAYOUT.scene.xaxis = {
                            title: resX.text
                        };
                        LAYOUT.scene.yaxis = {
                            title: resY.text
                        };
                    } else if (resY) {
                        console.log(2);
                        Timeseries.divide(resY.calc, resY);
                        LAYOUT.scene.yaxis = {
                            title: resY.text
                        };

                        LAYOUT.scene.xaxis = {
                            title: '1 \u2261 ' + Timeseries.stepLength + 'ms'
                        };
                    }

                    scope.refresh();
                }, true);

                scope.$watch('surface', function (newSurface) {
                    if (!newSurface) {
                        return;
                    }
                    DataConverter.fromFunctionExpression(newSurface);
                    scope.timeseries = Timeseries;

                }, true);

                //scope.setColorscale = function (name) {
                //    Plotly.restyle('plotly', {colorscale: name});
                //};

                scope.refresh = function () {

                    console.log(angular.copy(Timeseries.getRenderableValues()));

                    Plotly.newPlot('plotly', [{
                        z: Timeseries.getRenderableValues(),
                        type: 'surface'
                    }], LAYOUT);
                }
            }
        };
    });
