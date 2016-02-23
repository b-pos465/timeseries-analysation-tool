'use strict';

/**
 * This service provides selection functions for the timeseries plotter.
 * Right now this will not work for start dates that won't lie at the beginning of a certain interval.
 * An offset needs to be computed as well: TODO
 */
angular.module('myApp').service('SelectingService', function () {

    var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    /*
        Nothing smaller then milli seconds are supported.
     */
    var secInMSec = 1000;
    var minuteInMSec = 60 * secInMSec;
    var hourInMSec = 60 * minuteInMSec;
    var dayInMSec = 24 * hourInMSec;
    var weekInMSec = 7 * dayInMSec;

    function cutInSameSize(values, interval) {
        var result = [];
        for(var k = 0; k < values.length; k += interval){
            /*
                 If the last clice is smaller then interval we need a different logic.
                 Right now the last slice will be saved as well.
                 Alternatively we could add interpolated values or cut it completely.
             */
            if(k += interval < values.length) {
                result.push(values.slice(k, k + interval));
            } else {
                result.push(values.slice(k));
            }

        }
        return result;
    }
    this.getSeconds = function(values, stepLength) {
        return cutInSameSize(values, secInMSec/stepLength);
    };

    this.getMinutes = function(values, stepLength) {
        return cutInSameSize(values, minuteInMSec/stepLength);
    };

    this.getHours = function(values, stepLength) {
        return cutInSameSize(values, hourInMSec/stepLength);
    };

    this.getDays = function(values, stepLength) {
        return cutInSameSize(values, dayInMSec/stepLength);
    };

    this.getWeek = function(values, stepLength) {
        return cutInSameSize(values, weekInMSec/stepLength);
    };

    this.getMonth = function(values, stepLength) {
        var result = [];
        var oldCut = 0;
        for(var i = 0; i < monthLength.length; i++) {
            var currentCutStep = (monthLength[i] * dayInMSec) / stepLength;
            result.push(values.slice(oldCut, oldCut + currentCutStep));
            oldCut += currentCutStep;
        }
        return result;
    };


    return this;

});