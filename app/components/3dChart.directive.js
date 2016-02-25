'use strict';

angular.module('myApp')
    .directive('sandbox3dChart', function (DataConverterTo1D, DefaultSurfaceService, SelectingService, AggregatingService) {

        return {
            templateUrl: 'app/components/3dChart.html',
            restrict: 'E',
            scope: { // Isolate scope

            },
            link: function (scope) {

                scope.SelectingService = SelectingService;
                scope.AggregatingService = AggregatingService;

                scope.possibleColorscales = [
                    'Greys', 'YIGnBu', 'Greens', 'YIOrRd', 'Bluered', 'RdBu', 'Reds', 'Blues', 'Picnic', 'Rainbow', 'Portland', 'Jet', 'Hot'
                    , 'Blackbody', 'Earth', 'Electric', 'Viridis'
                ];

                scope.surfaces = [DefaultSurfaceService.getDefaultTimeseriesWrapper()];

                scope.$watch('surfaces', function (newSurfaces) {
                    if (newSurfaces.length < 1) {
                        return;
                    }

                    var data = [];

                    for (var i = 0; i < newSurfaces.length; i++) {

                        var basicArray = DataConverterTo1D.fromFunctionExpression(newSurfaces[i].dataDefinition.specs.funcTerm,
                            newSurfaces[i].dataDefinition.specs.count);

                        var temp = SelectingService.select(basicArray,
                            newSurfaces[i].dataDefinition.specs.interval,
                            newSurfaces[i].dataDefinition.specs.startdate,
                            newSurfaces[i].options.analytics.ySelection);


                        temp = AggregatingService.aggregateX(temp, newSurfaces[i].options.analytics.xAggregation);

                        if (newSurfaces[i].options.analytics.xAggregation !== 'Keine') {
                            temp= [temp, temp];
                        }
                        console.log(temp);

                        data.push({
                            z: temp,
                            type: 'surface'
                        });
                    }

                    render(data);
                }, true);

                scope.data = [];

                scope.addSurface = function () {
                    scope.surfaces.push(DefaultSurfaceService.getDefaultTimeseriesWrapper());
                };

                scope.setColorscale = function (name) {
                    Plotly.restyle('plotly', {colorscale: name});
                };

                function render(data) {
                    var layout = {
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
                    Plotly.newPlot('plotly', data, layout);
                }
            }
        };
    });
