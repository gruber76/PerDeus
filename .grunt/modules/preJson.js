module.exports = function (grunt) {

    grunt.registerTask("preJson", function() {
        var rawRates, rawZips, rates, zips, fs, settings, _;
        _ = require("lodash");
        settings = grunt.config("settings");
        rawRates = grunt.file.readJSON("src/data/rawRates.json");
        rawZips = grunt.file.readJSON("src/data/rawZips.json");
        rates = [];
        zips = [];

        _.each(rawRates, function mergeRates(rawRate) {
            var newRates, splitCity, splitCounty;
            newRates = [];

            _.each(rawRate, function(rateValue, rateKey) {
                if (_.isString(rateValue)) {
                    rawRate[rateKey] = rateValue.toUpperCase();
                }
            });

            splitCity = _.map(rawRate.City.split("/"), _.trim);
            splitCounty = _.map(
                _.map(rawRate.County.split("/"), function (countyName) {return countyName.split(" LESS")[0];}), _.trim
            );
            newRates = _.flatten(_.map(splitCity, function(city) {
                return _.flatten(_.map(splitCounty, function(county) {
                    return _.defaults({"City": _.trim(city)},{"County": _.trim(county)},rawRate)
                }));
            }));
            rates.push(newRates);
        });
        rates = _.flatten(rates);
        console.dir(grunt.config("settings"));
        grunt.file.write(settings.paths.dest + "/data/rates.json", JSON.stringify(rates, null, 2));


        // Rates not available in the data:
        rates = rates.concat(
            [
                {Meals: 56, State: "MA", County: "FRANKLIN"}, // Near Northampton
                {"State":"MA","County":"SUFFOLK","Meals":71.00}, // Boston's county name is off
                {"State":"NH","County":"CARROLL","Meals":61.00} // Typo in a database
            ]
        );

        _.each(rawZips, function mergeZips(rawZip) {
            // List of "states" to exclude:
            if (!_.contains(["PR", "VI", "AE"], rawZip.State)) {
                _.each(rawZip, function (zipValue, zipKey) {
                    if (_.isString(zipValue)) {
                        rawZip[zipKey] = zipValue.toUpperCase();
                    }
                });

                zips.push(_.defaults(_.defaults(_.findWhere(rates, {City: rawZip.City, State: rawZip.State}) || _.findWhere(rates, {County: rawZip.County, State: rawZip.State}) || {}, rawZip), {Meals: 46.00}));
            }
        });

        grunt.file.write(settings.paths.dest + "/data/zips.json", JSON.stringify(_.flatten(zips), null, 2));





    });
};