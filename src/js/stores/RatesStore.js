"use strict";

var _ = require("lodash");

var EventEmitter = require("events").EventEmitter;
var assign = require("object-assign");

var _rates = require("../../data/rates.json");
var _zips = require("../../data/zips.json");


var RatesStore = assign({}, EventEmitter.prototype, {
    getRateByZip: function getRateByZip(zip) {
        var zipMatch;
        zipMatch = _.findWhere(_zips, {"zip": zip});
        console.dir(zipMatch);
        if (_.isUndefined(zipMatch)) {
            return undefined;
        }
        var returnValue = this.getRateByCity(zipMatch.State, zipMatch.City);
        console.dir(returnValue);
        return returnValue;
    },
    getRateByCity: function getRateByCity(state, city) {
        return _.findWhere(_rates, {"state": state.toUpperCase(), "city": city.toUpperCase()});
    }
});

module.exports = RatesStore;