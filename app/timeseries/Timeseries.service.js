/**
 *
 * @param startdate - Date
 * @param stepLength - int: interval step in ms.
 * @param values - [float]
 * @constructor
 */
angular.module('myApp').service('Timeseries', function () {

    var self = this;
    this.set = function Timeseries(startdate, stepLength, values) {

        self.SAVE = {
            values: values
        };
        self.startdate = startdate;
        self.stepLength = stepLength;
        self.values = values;
        self.depth = 2;
    };


    /**
     * Cuts the most inner sub-arrays in parts by a
     * self defined function which works on all most inner sub-arrays.
     *
     * @param divFunc
     */
    this.divide = function (divFunc) {

        this.depth++;

        var temp = this.funcMostInnerArrays(this.values, this.values, divFunc, 0);
        if (angular.isDefined(temp)) {
            this.values = temp;
        }

    };


    this.getRenderableValues = function () {

        console.log(angular.copy(this.values));

        if (this.values && this.values[0].length === 1) {

            var copy = angular.copy(this.values);
            for (var i = 0; i < this.values.length; i++) {
                copy[i].push(copy[i][0]);
            }

            return copy;
        } else if (this.values && this.values.length === 1) {
            copy = angular.copy(this.values);
            copy.push(copy[0]);

            return copy;
        }

        return this.values;

    };

    /**
     * Aggregates a Timeseries by aggregating every most inner sub-array.
     *
     * The AggregatingService provides pre defined functions.
     *
     */
    this.aggregate = function (aggFunc) {
        this.depth--;
        var temp = this.funcMostInnerArrays(this.values, this.values, aggFunc, 0, true);
        if (angular.isDefined(temp)) {
            this.values = temp;
        }
    };

    /**
     * After aggregation, values can be lost. This function is for resetting the timeseries to its original.
     */
    this.reset = function () {
        this.depth = 2;
        this.values = this.SAVE.values;
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
     *
     * @return if inner array is outer array return value.
     */
    this.funcMostInnerArrays = function (parent, arr, func, i, isAgg) {
        if (angular.isArray(arr) && !angular.isArray(arr[0])) { //found most inner array

            var oldStep = this.stepLength;
            if (isAgg) {
                this.stepLength *= arr.length;
            }

            if (parent === arr) {
                return func(arr, oldStep, this.startdate);
            }
            parent[i] = func(arr, oldStep, this.startdate);

        } else {
            for (var t = 0; t < arr.length; t++) {
                this.funcMostInnerArrays(arr, arr[t], func, t, isAgg);
            }
        }
    };

    return this;
});