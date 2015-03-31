// npm install --save-dev connect-livereload es6ify grunt grunt-browserify grunt-contrib-clean grunt-contrib-connect grunt-contrib-copy grunt-contrib-livereload grunt-contrib-uglify grunt-contrib-watch grunt-jsxhint grunt-react grunt-watchify react-tools matchdep
// npm install flux object-assign react lodash

module.exports = function (grunt) {

    var settings = grunt.file.readJSON("./.grunt/settings.json");

    var browTrans = require("grunt-react").browserify;

    var es6ify = require("es6ify");

    var path = require("path");

    var lrSnippet  = require("grunt-contrib-livereload/lib/utils").livereloadSnippet;

    var _ = require("lodash");

    var mountFolder = function(connect, dir) {
        return connect.static(path.resolve(dir));
    };

    // Project configuration.
    config = {
        settings: settings,
        pkg: grunt.file.readJSON("./package.json"),
        clean: {
            build: settings.paths.dest
        },
        copy: {
            build: {
                cwd: settings.paths.src,
                src: ["*.html", "data/*.json"],
                dest: settings.paths.dest,
                expand: true
            }
        },
        connect: {
            options: {
                port: 9000,
                // Change this to "0.0.0.0" to access the server from outside.
                hostname: "localhost"
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            require("connect-livereload")(),
                            lrSnippet,
                            mountFolder(connect, settings.paths.dest)
                        ];
                    }
                }
            },
            static: {
                options: {
                    keepalive: true,
                    middleware: function(connect) {
                        return [
                            mountFolder(connect, settings.paths.dest)
                        ];
                    }
                }
            }
        },
        browserify: {
            options: {
                transform: [browTrans, es6ify]
            },
            app: {
                src: [
                    settings.paths.src + "/js/**/*.js",
                    settings.paths.src + "/js/**/*.jsx"
                ],
                dest: settings.paths.dest + "/js/app.js"
            }
        },
        watch: {
            html: {
                files: [settings.paths.src + "/**/*.html"],
                tasks: ["copy"],
                options: {
                    livereload: true
                }
            },
            js: {
                files: [
                    settings.paths.src + "/js/**/*.jsx",
                    settings.paths.src + "/js/**/*.js"
                ],
                tasks: ["browserify"]
            },
            app: {
                files: settings.paths.dest + "/js/app.js",
                options: {
                    livereload: true
                }
            }
        },
        react: {
            options: {
                extension: "jsx",
                ignoreMTime: true
            }
        },
        uglify: {

        },
        jshint: {
            src: [settings.paths.src + "/**/*.js", settings.paths.src + "/**/*.jsx"],
            options: {
                jshintrc: true
            }
        }
    };

    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.registerTask("preJson", function() {
        var rawRates, rawZips, rates, zips, fs;
        fs = require("fs");
        rawRates = require("../src/data/rawRates.json");
        rawZips = require("../src/data/rawZips.json");
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
        fs.writeFileSync("./src/data/rates.json", JSON.stringify(rates, null, 2));


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

        fs.writeFileSync("./src/data/zips.json", JSON.stringify(_.flatten(zips), null, 2));





    });

    grunt.registerTask("live", ["clean", "copy", "browserify", "connect:livereload", "watch"]);

    grunt.registerTask("default", ["clean", "copy", "browserify", "connect:static"]);

    return config;
};