/**
 *
 * @param startdate - Date
 * @param stepLength - int: interval step in ms.
 * @param values - [float]
 * @constructor
 */
function Timeseries(startdate, stepLength, values) {

    this.startdate = startdate;
    this.stepLength = stepLength;
    this.values = values;

    /**
     * Cuts the whole Timeseries in parts and returns the [[float, float, ...],[float, float, ...], ...] array
     * as TimeseriesSelection.
     *
     * The SelectingService provides pre defined functions.
     *
     * @param compFunc
     * @returns TimeseriesSelection
     */
    this.selectBy = function (compFunc) {
        return new TimeseriesSelection(compFunc(this.values, this.stepLength));
    };
}

/**
 * Represents a selection from a timeseries.
 * Datatype: [[float, float, ...],[float, float, ...], ...], in which each sub-array can differ in size.
 *
 * @param values
 * @constructor
 */
function TimeseriesSelection(values) {
    this.values = values;

    /**
     * Aggregates a TimeseriesSelection by aggregating every sub-array.
     *
     * The AggregatingService provides pre defined functions.
     *
     * @param aggFunc - The function which will be called on TimeseriesSelection.values.
     * @returns [float]
     */
    this.aggregateBy = function (aggFunc) {
        return aggFunc(this.values);
    }
}