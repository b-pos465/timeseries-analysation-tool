'use strict';

/**
 * This service provides dividing functions.
 * Provided intervals are:
 *  - seconds
 *  - minutes
 *  - hours
 *  - days
 *  - weeks
 */
angular.module('TimeseriesAnalysationTool').service('DividingService', function () {

    /*
     Nothing smaller then milliseconds is supported.
     */
    var secInMSec = 1000;
    var minuteInMSec = 60 * secInMSec;
    var hourInMSec = 60 * minuteInMSec;
    var dayInMSec = 24 * hourInMSec;
    var weekInMSec = 7 * dayInMSec;
    var yearInMSec = 365 * dayInMSec;

    var self = this;

    function cutInSameSize(values, interval) {
        var result = [];

        for (var k = 0; k < values.length; k += interval) {
            /*
             If the last slice is smaller then interval we need a different logic.
             Right now the last slice will be saved as well.
             Alternatively we could add interpolated values or cut it completely.
             */
            if (k + interval <= values.length) {
                result.push(values.slice(k , k + interval ));
            } else {
                result.push(values.slice(k));
            }
        }
        return result;
    }

    this.getSeconds = function (values, stepLength) {

        if (!angular.isArray(values)) {
            return [values];
        }

        return cutInSameSize(values, secInMSec / stepLength);
    };

    this.getMinutes = function (values, stepLength) {

        if (!angular.isArray(values)) {
            return [values];
        }

        return cutInSameSize(values, minuteInMSec / stepLength);
    };

    this.getHours = function (values, stepLength) {

        if (!angular.isArray(values)) {
            return [values];
        }

        return cutInSameSize(values, hourInMSec / stepLength);
    };

    this.getDays = function (values, stepLength) {

        if (!angular.isArray(values)) {
            return [values];
        }

        return cutInSameSize(values, dayInMSec / stepLength);
    };

    this.getWeeks = function (values, stepLength) {

        if (!angular.isArray(values)) {
            return [values];
        }

        return cutInSameSize(values, weekInMSec / stepLength);
    };

    this.getYears = function (values, stepLength) {

        if (!angular.isArray(values)) {
            return [values];
        }

        return cutInSameSize(values, yearInMSec / stepLength);
    };


    this.possibleResolutions = [{
        text: 'Original',
        value: null,
        calc: function (values) {
            return _.map(values, function(i) {
                return [i];
            });
        }
    }, {
        text: 'Sekunde/n',
        value: secInMSec,
        calc: self.getSeconds
    }, {
        text: 'Minute/n',
        value: minuteInMSec,
        calc: self.getMinutes
    }, {
        text: 'Stunde/n',
        value: hourInMSec,
        calc: self.getHours
    }, {
        text: 'Tag/e',
        value: dayInMSec,
        calc: self.getDays
    }, {
        text: 'Woche/n',
        value: weekInMSec,
        calc: self.getWeeks
    }, {
        text: 'Jahr/e',
        value: yearInMSec,
        calc: self.getYears
    }];

    return this;
});