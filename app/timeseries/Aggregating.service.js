'use strict';

/**
 * This service provides aggregate functions.
 * Each of these functions work on an array and returns a scalar.
 * Provided functions are:
 *  - sum
 *  - avg
 *  - max
 *  - min
 */
angular.module('TimeseriesAnalysationTool').service('AggregatingService', function () {

    /**
     * Sums all values in one interval up.
     *
     * @param values - [number] array.
     * @returns number
     */
    this.sum = function (values) {
        return values.reduce(function (prev, curValue) {
            return prev + curValue;
        });
    };

    var sum = this.sum;

    /**
     * Builds the average of all values in one interval.
     * Uses the sum function.
     *
     * @param values - [number] array.
     * @returns number
     */
    this.avg = function (values) {

        return sum(values) / values.length;
    };

    /**
     * Determines the maximal element in each interval.
     *
     * @param values - [number] array.
     * @returns number
     */
    this.max = function (values) {

        var max = values[0];
        for (var i = 0; i < values.length; i++) {
            if (values[i] > max) {
                max = values[i];
            }
        }
        return max;
    };

    /**
     * Determines the minimal element in each interval.
     *
     * @param values - [number] array.
     * @returns number
     */
    this.min = function (values) {
        var min = values[0];
        for (var i = 0; i < values.length; i++) {
            if (values[i] < min) {
                min = values[i];
            }
        }

        return min;
    };

    var self = this;

    /*
    This object is needed for ng-repeat to generate the GUI.
    It only supports the german language so far. If you need a different language change the strings below.
     */
    this.possibleAggregations = [
        {
            text: 'Summe',
            calc: self.sum
        }, {
            text: 'Durchschnitt',
            calc: self.avg
        }, {
            text: 'Maximum',
            calc: self.max
        }, {
            text: 'Minimum',
            calc: self.min
        }
    ];

    return this;
});