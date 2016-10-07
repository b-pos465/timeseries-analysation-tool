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

    var self = this;

    function cutInSameSize(values, interval, offset) {
        var result = [];

        result.push(values.slice(0, interval - offset));
        for (var k = interval - offset; k < values.length; k += interval) {
            /*
             If the last slice is smaller then interval we need a different logic.
             Right now the last slice will be saved as well.
             Alternatively we could add interpolated values or cut it completely.
             */
            if (k + interval <= values.length) {
                result.push(values.slice(k , k + interval ));
            } else {
                console.log('Rest aufgetreten!');
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
        console.log(values, offset, minuteInMSec / stepLength);

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

    this.getWeeks = function (values, stepLength, startdate) {
        var offset = startdate.getTime() % weekInMSec;

        return cutInSameSize(values, weekInMSec / stepLength, offset);
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
        text: 'Sekunden',
        value: secInMSec,
        calc: self.getSeconds
    }, {
        text: 'Minuten',
        value: minuteInMSec,
        calc: self.getMinutes
    }, {
        text: 'Stunden',
        value: hourInMSec,
        calc: self.getHours
    }, {
        text: 'Tage',
        value: dayInMSec,
        calc: self.getDays
    }, {
        text: 'Wochen',
        value: weekInMSec,
        calc: self.getWeeks
    }];

    return this;
});