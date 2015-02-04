// npm install --save-dev es6ify grunt grunt-browserify grunt-contrib-clean grunt-contrib-connect grunt-contrib-copy grunt-contrib-livereload grunt-contrib-uglify grunt-contrib-watch grunt-jsxhint grunt-react grunt-watchify react-tools matchdep
// npm install flux object-assign react

module.exports = function (grunt) {

    var settings = grunt.file.readJSON('./.grunt/settings.json');

    var browTrans = require('grunt-react').browserify;

    var es6ify = require('es6ify');

    var path = require('path');

    var lrSnippet  = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;

    var mountFolder = function(connect, dir) {
        return connect.static(path.resolve(dir));
    };

    // Project configuration.
    config = {
        settings: settings,
        pkg: grunt.file.readJSON('./package.json'),
        clean: {
            build: settings.paths.dest
        },
        copy: {
            build: {
                cwd: settings.paths.src,
                src: ['*.html'],
                dest: settings.paths.dest,
                expand: true
            }
        },
        connect: {
            options: {
                port: 9000,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            lrSnippet,
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
                    settings.paths.src + '/js/**/*.js',
                    settings.paths.src + '/js/**/*.jsx'
                ],
                dest: settings.paths.dest + '/js/app.js'
            }
        },
        watch: {
            html: {
                files: [settings.paths.src + '/**/*.html'],
                tasks: ['copy'],
                options: {
                    livereload: true
                }
            },
            js: {
                files: [
                    settings.paths.src + '/js/**/*.jsx',
                    settings.paths.src + '/js/**/*.js'
                ],
                tasks: ['browserify']
            },
            app: {
                files: settings.paths.dest + '/js/app.js',
                options: {
                    livereload: true
                }
            }
        },
        react: {
            options: {
                extension: 'jsx',
                ignoreMTime: true
            }
        },
        uglify: {

        },
        jshint: {
            src: [settings.paths.src + '/**/*.js', settings.paths.src + '/**/*.jsx'],
            options: {
                jshintrc: true
            }
        }
    };

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.registerTask('default', ['clean', 'copy', 'browserify', 'connect', 'watch']);

    return config;
};