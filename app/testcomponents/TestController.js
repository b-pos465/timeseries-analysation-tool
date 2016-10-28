'use strict';

angular.module('TimeseriesAnalysationTool').controller('TestController', ['$scope', 'DefaultTimeseriesDefinition', function($scope, DefaultTimeseriesDefinition) {

    DefaultTimeseriesDefinition.getDefaultArrayBasedTimeseries().then(function(res) {
        $scope.data = res;
    });

}]);