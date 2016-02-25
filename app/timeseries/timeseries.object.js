/**
 *
 * @param startdate - Date
 * @param stepLength - int: interval step in ms.
 * @param values - [float]
 * @constructor
 */
function Timeseries(startdate, stepLength, values) {

    this.SAVE = {
        values: values
    };
    this.depth = 2;
    this.startdate = startdate;
    this.stepLength = stepLength;
    this.values = [[[values, values], [values]]];

    /**
     * Cuts the most inner sub-arrays in parts by a
     * self defined function which works on all most inner sub-arrays.
     *
     * @param divFunc
     */
    this.divide = function (divFunc) {
        this.depth++;

        this.funcMostInnerArrays(this.values, this.values, divFunc, 0);

    };

    /**
     * Aggregates a Timeseries by aggregating every most inner sub-array.
     *
     * The AggregatingService provides pre defined functions.
     *
     * @param aggFunc - The function which will be called on TimeseriesSelection.values.
     * @returns [float]
     */
    this.aggregate = function (aggFunc) {
        this.depth--;
        this.funcMostInnerArrays(this.values, this.values, aggFunc, 0);
    };

    /**
     * After aggregation, values can be lost. This function is for resetting the timeseries to its original.
     */
    this.reset = function () {
        this.depth = 2;
        this.values = this.SAVE.values;
    };

    /**
     * This function searches for the most inner arrays and uses the aggFunc on this array.
     * then this array will be replaces with the result of the aggFunc. It should work with
     * the dividing functions as well as long as they return an array like this: [[],[], ...].
     *
     * @param parent - parent array reference to replace the array.
     * @param arr - current array being processed.
     * @param aggFunc - func to use on most inner arrays.
     * @param i - index of the sub-array in the parent array; for replacing.
     */
    this.funcMostInnerArrays = function (parent, arr, aggFunc, i) {
        if (angular.isArray(arr) && !angular.isArray(arr[0])) { //found most inner array
            parent[i] = aggFunc(arr);
        } else {
            for (var t = 0; t < arr.length; t++) {
                this.funcMostInnerArrays(arr, arr[t], aggFunc, t);
            }
        }
    }
}