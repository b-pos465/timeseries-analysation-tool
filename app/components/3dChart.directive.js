'use strict';

angular.module('myApp')
    .directive('sandbox3dChart', function (DataConverterTo1D, DefaultTimeseriesDefinition, DividingService, AggregatingService) {

        return {
            templateUrl: 'app/components/3dChart.html',
            restrict: 'E',
            scope: {},
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
                    var data = [];

                    for (var i = 0; i < newSurfaces.length; i++) {

                        scope.timeseries.push(DataConverterTo1D.fromFunctionExpression(newSurfaces[i]));
                        //scope.timeseries[0].divide(DividingService.getDays);

                        scope.timeseries[0].divide(DividingService.getHours);
                        //console.log(scope.timeseries[0].values);
                        //scope.timeseries[0].aggregate(AggregatingService.avg);
                        //console.log(scope.timeseries[0].values);

                        //data.push({
                        //    z: scope.timeseries[0].values,
                        //    type: 'surface'
                        //});
                        data.push(createMesh3D(scope.timeseries[0].values, 1, 1));
                        console.log(createMesh3D(scope.timeseries[0].values, 1, 1));
                        console.log(scope.timeseries[0].values);
                    }

                    scope.render(data);
                }, true);

                function createMesh3D(values, xstretch, ystretch) {

                    var result = {
                        type: 'mesh3d',
                        x: [],
                        y: [],
                        z: [],
                        i: [],
                        j: [],
                        k: [],
                        colorscale: [
                            [0, 'rgb(255, 0, 0)'],
                            [0.5, 'rgb(0, 255, 0)'],
                            [1, 'rgb(0, 0, 255)']
                        ]
                    };

                    var dim0 = values.length;
                    var dim1 = values[0].length;

                    console.log(dim0, dim1);

                    // vertices
                    for (var j = 0; j < dim1; j++) {
                        result.x.push(0);
                        result.y.push(j * ystretch);
                        result.z.push(values[0][j]);

                    }

                    for (var i = 0; i < dim0 - 1; i++) {
                        for (j = 0; j < dim1; j++) {
                            result.x.push((i + 1) * xstretch);
                            result.y.push(j * ystretch);
                            result.z.push(values[i][j]);

                        }
                        for (j = 0; j < dim1; j++) {
                            result.x.push((i + 1) * xstretch);
                            result.y.push(j * ystretch);
                            result.z.push(values[i + 1][j]);
                        }
                    }

                    for (j = 0; j < dim1; j++) {
                        result.x.push(dim0 * xstretch);
                        result.y.push(j * ystretch);
                        result.z.push(values[dim0 - 1][j]);
                    }

                    // color scale intensity for each vertex
                    result.intensity = [];
                    for (i = 0; i < 2 * dim0; i++) {
                        for (j = 0; j < dim1; j++) {
                            if (result.z[i * dim1 + j]) {
                                result.intensity.push(result.z[i * dim1 + j]);
                            } else {
                                result.intensity.push(0);
                            }

                        }
                    }



                    //indices
                    for (i = 0; i < 2 * dim0 - 1; i++) {
                        for (j = 0; j < dim1 - 1; j++) {

                            // first triangle
                            result.i.push(i * dim1 + j);
                            result.j.push(i * dim1 + j + 1);
                            result.k.push((i + 1) * dim1 + j + 1);

                            //second triangle
                            result.i.push(i * dim1 + j);
                            result.j.push((i + 1) * dim1 + j + 1);
                            result.k.push((i + 1) * dim1 + j);
                        }
                    }

                    return result;
                }

                scope.addSurface = function () {
                    scope.surfaces.push(DefaultTimeseriesDefinition.getDefaultFunctionBasedTimeseries());
                };

                //scope.setColorscale = function (name) {
                //    Plotly.restyle('plotly', {colorscale: name});
                //};

                scope.render = function (data) {

                    Plotly.newPlot('plotly', data, LAYOUT); // TODO
                }
            }
        };
    });
