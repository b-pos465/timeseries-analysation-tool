'use strict';

angular.module('myApp')
    .directive('sandbox3dChart', function (DataConverterTo1D, DefaultTimeseriesDefinition, DividingService, AggregatingService) {

        return {
            templateUrl: 'app/components/3dChart.html',
            restrict: 'E',
            scope: {

            },
            link: function (scope) {

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
                    }
                };
                scope.possibleColorscales = [
                    'Greys', 'YIGnBu', 'Greens', 'YIOrRd', 'Bluered', 'RdBu', 'Reds', 'Blues', 'Picnic', 'Rainbow', 'Portland', 'Jet', 'Hot'
                    , 'Blackbody', 'Earth', 'Electric', 'Viridis'
                ];

                scope.surfaces = [DefaultTimeseriesDefinition.getDefaultFunctionBasedTimeseries()];
                scope.timeseries = [];

                scope.$watch('surfaces', function (newSurfaces) {
                    if (newSurfaces.length < 1) {
                        return;
                    }
                    scope.timeseries = [];

                    for (var i = 0; i < newSurfaces.length; i++) {

                        scope.timeseries.push(DataConverterTo1D.fromFunctionExpression(newSurfaces[i]));
                        //scope.timeseries[0].aggregate(AggregatingService.avg);
                        //console.log(scope.timeseries[0]);
                        scope.timeseries[0].divide(DividingService.getDays);
                        console.log(scope.timeseries[0].values);
                        scope.timeseries[0].divide(DividingService.getHours);
                        console.log(scope.timeseries[0].values);
                        scope.timeseries[0].aggregate(AggregatingService.avg);
                        console.log(scope.timeseries[0].values);
                    }
                }, true);

                scope.addSurface = function () {
                    scope.surfaces.push(DefaultTimeseriesDefinition.getDefaultFunctionBasedTimeseries());
                };

                scope.setColorscale = function (name) {
                    Plotly.restyle('plotly', {colorscale: name});
                };

                scope.render= function() {

                    Plotly.newPlot('plotly', null, LAYOUT); // TODO
                }
            }
        };
    });
