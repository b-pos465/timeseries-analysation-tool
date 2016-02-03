'use strict';

angular.module('myApp')
    .directive('sandbox3dChart', function (DataConverterFrom, DefaultSurfaceService) {

        return {
            templateUrl: 'components/3dChart.html',
            restrict: 'E',
            scope: { // Isolate scope

            },
            link: function (scope) {

                DataConverterFrom.functionExpression('');

                scope.surfaces = [{
                    meta: {
                        name: 'Default',
                        active: true
                    },
                    dataDefinition: {
                        type: 'function', // or 1-D array with width, height or 2-D array with width, height.,
                        specs: {
                            funcTerm: '0.5 * x+ 0.5 * y - 10',
                            xCount: 20,
                            yCount: 10
                        }
                    },
                    options: {
                        analytics: {
                            showDailyAverage: false,
                            showYearlyAverage: false
                        }
                    }
                }];

                scope.options = {
                    analytics: {
                        showDailyAverage: false,
                        showYearlyAverage: false
                    }
                };

                scope.$watch('surfaces', function (newSurfaces) {

                    if (newSurfaces.length < 1) {
                        return;
                    }

                    console.log('changes');

                    var data = [];

                    for (var i = 0; i < newSurfaces.length; i++) {
                        data.push({
                            z: DataConverterFrom.functionExpression(newSurfaces[i].dataDefinition.specs.funcTerm,
                                newSurfaces[i].dataDefinition.specs.xCount,
                                newSurfaces[i].dataDefinition.specs.yCount),
                            type: 'surface'
                        });
                    }

                    render(data);
                }, true);

                scope.data = [];

                scope.possibleColorscales = [
                    'Greys', 'YIGnBu', 'Greens', 'YIOrRd', 'Bluered', 'RdBu', 'Reds', 'Blues', 'Picnic', 'Rainbow', 'Portland', 'Jet', 'Hot'
                    , 'Blackbody', 'Earth', 'Electric', 'Viridis'
                ];

                scope.range = [0.0, 1.0];

                // Series names and parser related vars.
                scope.seriesNames = scope.seriesNames || [];
                if (angular.isString(scope.seriesNames)) {
                    scope.customNames = scope.seriesNames.join(', ');
                } else {
                    scope.customNames = scope.seriesNames;
                }

                scope.addSurface = function () {
                    scope.surfaces.push(DefaultSurfaceService.getDefault());
                };

                //var parseData = function () {
                //
                //    // Test timeseries with linear values
                //    var data = DataConverterFrom.functionExpression("0.5 * x+ 0.5 * y - 10", 40, 20);
                //    var data2 = DataConverterFrom.functionExpression("0", 40, 20);
                //
                //    var min = data[0][0];
                //    var max = data[0][0];
                //    for (var i = 0; i < data.length; i++) {
                //        for( var  j= 0; j < data[0].length; j++) {
                //            if (data[i][j] > max) {
                //                max = data[i][j];
                //            }
                //            if (data[i][j] < min) {
                //                min = data[i][j];
                //            }
                //        }
                //    }
                //
                //    if (max > 0) {
                //        scope.range = [min, max];
                //    } else {
                //        scope.range = [min, 1];
                //    }
                //
                //    scope.currentMin = scope.range[0];
                //    scope.currentMax = scope.range[1];
                //
                //    scope.data = [{
                //        z: data,
                //        type: 'surface'
                //    }, {
                //        z: data2,
                //        type: 'surface'
                //    }];
                //};

                function render(data) {
                    var layout = {
                        title: null,
                        autosize: false,
                        width: $(document).width()/2,
                        height: $(document).width()/2,
                        margin: {
                            l: 65,
                            r: 50,
                            b: 65,
                            t: 90
                        }
                    };
                    Plotly.newPlot('plotly', data, layout);
                }

                scope.setMin = function (min) {
                    Plotly.restyle('plotly', {zmin: min});
                };

                scope.setMax = function (max) {
                    Plotly.restyle('plotly', {zmax: max});
                };

                scope.setColorscale = function (name) {
                    Plotly.restyle('plotly', {colorscale: name});
                };

                //parseData();
            }
        };
    });
