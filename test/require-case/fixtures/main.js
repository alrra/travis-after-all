#!/usr/bin/env node

var travisAfterAll = require('./../../../lib/travis-after-all');

travisAfterAll(function (exitCode, error) {

    if ( exitCode === 0 ) {
        console.log('Doing task 1...');
    } else if ( exitCode === 1) {
        console.log('Doing task 2...');
    }

    travisAfterAll(function (exitCode) {

        if ( exitCode === 0 ) {
            console.log('Doing task 3...');
        }

        travisAfterAll(function (exitCode) {
            if ( exitCode === 0 ) {
                console.log('Doing task 4...');
            }
        });

    });

});
