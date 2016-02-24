'use strict';

/**
 * This service provides selection functions for the timeseries plotter.
 */
angular.module('myApp').service('SelectingService', function () {

    /*
     Nothing smaller then milli seconds are supported.
     */
    var secInMSec = 1000;
    var minuteInMSec = 60 * secInMSec;
    var hourInMSec = 60 * minuteInMSec;
    var dayInMSec = 24 * hourInMSec;
    var weekInMSec = 7 * dayInMSec;

    this.possibleSelections = ['original', 'in Sec', 'in Min', 'in Hour', 'in Days', 'in Weeks'];
    this.getPossibleSelections = function(stepLength) {
        if (stepLength < secInMSec) {
            return this.possibleSelections;
        } else if(stepLength < minuteInMSec) {
            return [this.possibleSelections[0]].concat(this.possibleSelections.slice(2));
        } else if(stepLength < hourInMSec) {
            return [this.possibleSelections[0]].concat(this.possibleSelections.slice(3));
        } else if(stepLength < dayInMSec) {
            return [this.possibleSelections[0]].concat(this.possibleSelections.slice(4));
        } else if(stepLength < weekInMSec) {
            return [this.possibleSelections[0]].concat(this.possibleSelections.slice(5));
        }
    };
    var FILL_VALUE = 0;



    function cutInSameSize(values, interval, offset) {
        var result = [];

        result.push(values.slice(0, interval - offset));
        for (var k = interval - offset; k < values.length; k += interval) {
            /*
             If the last clice is smaller then interval we need a different logic.
             Right now the last slice will be saved as well.
             Alternatively we could add interpolated values or cut it completely.
             */
            if (k += interval < values.length) {
                result.push(values.slice(k, k + interval));
            } else {
                result.push(values.slice(k));
            }

        }
        return result;
    }

    function fillValues(values, stepLength, msec) {
        var diff = msec / stepLength - values[0].length;
        if (diff != 0) {
            for(var i = 0; i < diff; i++) {
                values[0].push(FILL_VALUE);
            }
        }

        diff = msec / stepLength - values[values.length - 1].length;
        if (diff != 0) {
            for(i = 0; i < diff; i++) {
                values[values.length - 1].push(FILL_VALUE);
            }
        }

        if (values.length === 1) {
            return [values[0], values[0]];
        }

        return values;
    }

    this.select = function(values, stepLength, startdate, selecString) {

        for (var i = 0; i < this.possibleSelections.length; i++) {
            if(selecString === this.possibleSelections[i]) {
                return this.possibleFunctions[i](values, stepLength, startdate);
            }
        }
    };

    this.getSeconds = function (values, stepLength, startdate) {
        var offset = startdate.getTime() % secInMSec;

        return fillValues(cutInSameSize(values, secInMSec / stepLength, offset), stepLength, secInMSec);
    };

    this.getMinutes = function (values, stepLength, startdate) {
        var offset = startdate.getTime() % minuteInMSec;

        return fillValues(cutInSameSize(values, minuteInMSec / stepLength, offset), stepLength, minuteInMSec);
    };

    this.getHours = function (values, stepLength, startdate) {
        var offset = startdate.getTime() % hourInMSec;

        return fillValues(cutInSameSize(values, hourInMSec / stepLength, offset), stepLength, hourInMSec);
    };

    this.getDays = function (values, stepLength, startdate) {
        var offset = startdate.getTime() % dayInMSec;

        return fillValues(cutInSameSize(values, dayInMSec / stepLength, offset), stepLength, dayInMSec);
    };

    this.getWeek = function (values, stepLength, startdate) {
        var offset = startdate.getTime() % weekInMSec;

        return fillValues(cutInSameSize(values, weekInMSec / stepLength, offset), stepLength, weekInMSec);
    };

    this.getOriginal = function (values) {
        return [values, values];
    };

    this.possibleFunctions = [this.getOriginal, this.getSeconds, this.getMinutes, this.getHours, this.getDays, this.getWeek];

    return this;

});