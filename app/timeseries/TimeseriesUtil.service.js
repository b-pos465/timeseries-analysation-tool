'use strict';

/**
 * TimeseriesUtil Service provides function to execute aggregating and dividing functions on a timeseries.
 * Furthermore it contains a function for a few edge cases called getRenderableValues.
 * Last but not least it contains the 'constructor' for a new Timeseries.
 */
angular.module('TimeseriesAnalysationTool').service('TimeseriesUtil', function () {

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
            timeseries.values = temp;
        }
    };

    this.getRenderableValues = function (timeseries) {
        if (timeseries.values && timeseries.values.length > 1 && timeseries.values[0].length === 1) {
            var copy = angular.copy(timeseries.values);
            for (var i = 0; i < timeseries.values.length; i++) {
                copy[i].push(copy[i][0]);
            }

            return copy;
        } else if (timeseries.values && timeseries.values.length === 1 && timeseries.values[0].length > 1) {
            copy = angular.copy(timeseries.values);
            copy.push(copy[0]);

            return copy;
        } else if (timeseries.values && timeseries.values.length === 1 && timeseries.values[0].length === 1 ) {
            var t = timeseries.values[0][0];
            return [[t, t], [t, t]];
        }

        return timeseries.values;
    };

    /**
     * Aggregates a timeseries by aggregating every most inner sub-array.
     *
     * The AggregatingService provides pre defined functions.
     */
    this.aggregate = function (timeseries, aggFunc) {

        var temp = this.funcMostInnerArrays(timeseries.values, timeseries.values, aggFunc, 0, true, timeseries);
        if (angular.isDefined(temp)) {
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