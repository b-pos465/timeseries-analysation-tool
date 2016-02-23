'use strict';

/**
 * This service provides aggregate functions for the timeseries plotter.
 * Each of this function works on [[float], [float], ..] arrays saved in a TimeseriesSelection object.
 * Provided functions are:
 *  - sum
 *  - avg
 *  - max
 *  - min
 */
angular.module('myApp').service('AggregatingService', function () {

    /**
     * Sums all values in one interval up.
     *
     * @param values - [[float], [float], ..] values of a TimeseriesSelection object.
     * @returns [float]
     */
    this.sum = function (values) {

        var result = [];
        for (var i = 0; i < values.length; i++) {
            result.push(values.reduce(function (prev, curValue) {
                return prev + curValue;
            }));
        }
        return result;
    };

    /**
     * Builds the average of all values in one interval.
     * Uses the sum function.
     *
     * @param values - [[float], [float], ..] values of a TimeseriesSelection object.
     * @returns [float]
     */
    this.avg = function (values) {

        var temp = this.sum(values);
        for (var i = 0; i < temp.length; i++) {
            temp[i] = temp[i] / values[i].length; // divide each sum by the length of the original array
        }

        return temp;
    };

    /**
     * Determines the maximal element in each interval.
     *
     * @param values - [[float], [float], ..] values of a TimeseriesSelection object.
     * @returns [float]
     */
    this.max = function (values) {
        var result = [];
        for (var i = 0; i < values.length; i++) {
            var max = values[i][0];
            for (var j = 1; j < values[i].length; j++) {
                if(values[i][j] > max) {
                    max = values[i][j];
                }
            }
            result.push(max);
        }

        return result;
    };

    /**
     * Determines the minimal element in each interval.
     *
     * @param values - [[float], [float], ..] values of a TimeseriesSelection object.
     * @returns [float]
     */
    this.min = function (values) {
        var result = [];
        for (var i = 0; i < values.length; i++) {
            var min = values[i][0];
            for (var j = 1; j < values[i].length; j++) {
                if(values[i][j] < min) {
                    min = values[i][j];
                }
            }
            result.push(max);
        }

        return result;
    };

    return this;

});