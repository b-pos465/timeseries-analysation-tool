'use strict';

angular.module('myApp')
    .directive('sandbox3dChart', function (DataConverterTo1D, DefaultTimeseriesDefinition, DividingService, AggregatingService) {

        return {
            templateUrl: 'app/components/3dChart.html',
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

                    console.log(newOpt);

                    if (!newOpt || !scope.timeseries) {
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


                    scope.timeseries.reset();
                    console.log(scope.timeseries.values, resY);

                    if (resY && agg && resX) {
                        scope.timeseries.divide(resY.calc);
                        console.log(angular.copy(scope.timeseries.values));
                        scope.timeseries.divide(resX.calc);
                        console.log(scope.timeseries.values);
                        scope.timeseries.aggregate(agg.calc);
                        console.log(scope.timeseries.values);

                        LAYOUT.scene.xaxis = {
                            title: resX.text
                        };
                        LAYOUT.scene.yaxis = {
                            title: resY.text
                        };
                    }

                    if (resY) {
                        scope.timeseries.divide(resY.calc);
                        LAYOUT.scene.yaxis = {
                            title: resY.text
                        };
                    }

                    scope.refresh();
                }, true);

                scope.$watch('surface', function (newSurface) {
                    if (!newSurface) {
                        return;
                    }
                    scope.timeseries = DataConverterTo1D.fromFunctionExpression(newSurface);
                    //scope.timeseries.divide(DividingService.getDays);
                    //scope.timeseries.divide(DividingService.getHours);


                    //console.log(scope.timeseries[0].values);
                    //scope.timeseries.aggregate(AggregatingService.avg);
                    //console.log(scope.timeseries[0].values);

                    //console.log(scope.timeseries.values);

                    //scope.refresh();
                }, true);

                //scope.setColorscale = function (name) {
                //    Plotly.restyle('plotly', {colorscale: name});
                //};

                scope.refresh = function () {

                    Plotly.newPlot('plotly', [{
                        z: scope.timeseries.values,
                        type: 'surface'
                    }], LAYOUT);
                }
            }
        };
    });
