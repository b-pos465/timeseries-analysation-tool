'use strict';

/**
 * This service provides diving functions for the Timeseries object.
 */
angular.module('myApp').service('DividingService', function () {

    /*
     Nothing smaller then milli seconds are supported.
     */
    var secInMSec = 1000;
    var minuteInMSec = 60 * secInMSec;
    var hourInMSec = 60 * minuteInMSec;
    var dayInMSec = 24 * hourInMSec;
    var weekInMSec = 7 * dayInMSec;


    function cutInSameSize(values, interval, offset) {
        var result = [];

        result.push(values.slice(0, interval - offset));
        for (var k = interval - offset; k < values.length; k += interval) {
            /*
             If the last slice is smaller then interval we need a different logic.
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

    this.fillValues = function (values, stepLength, msec, fillValue) {
        var diff = msec / stepLength - values[0].length;
        if (diff != 0) {
            for (var i = 0; i < diff; i++) {
                values[0].push(fillValue);
            }
        }

        diff = msec / stepLength - values[values.length - 1].length;
        if (diff != 0) {
            for (i = 0; i < diff; i++) {
                values[values.length - 1].push(fillValue);
            }
        }

        if (values.length === 1) {
            return [values[0], values[0]];
        }

        return values;
    };

    this.getSeconds = function (values, stepLength, startdate) {
        var offset = startdate.getTime() % secInMSec;

        if (!angular.isArray(values)) {
            return [values];
        }

        return cutInSameSize(values, secInMSec / stepLength, offset);
    };

    this.getMinutes = function (values, stepLength, startdate) {
        var offset = startdate.getTime() % minuteInMSec;

        if (!angular.isArray(values)) {
            return [values];
        }

        return cutInSameSize(values, minuteInMSec / stepLength, offset);
    };

    this.getHours = function (values, stepLength, startdate) {
        var offset = startdate.getTime() % hourInMSec;

        if (!angular.isArray(values)) {
            return [values];
        }

        return cutInSameSize(values, hourInMSec / stepLength, offset);
    };

    this.getDays = function (values, stepLength, startdate) {
        var offset = startdate.getTime() % dayInMSec;

        return cutInSameSize(values, dayInMSec / stepLength, offset);
    };

    this.getWeek = function (values, stepLength, startdate) {
        var offset = startdate.getTime() % weekInMSec;

        return cutInSameSize(values, weekInMSec / stepLength, offset);
    };

    return this;
});