#!/usr/bin/env node

var travisAfterAll = require('./../../../lib/travis-after-all');

travisAfterAll(function (result) {

    if ( result === 0 ) {
        console.log('Doing task 1...');
    } else if ( result === 1) {
        console.log('Doing task 2...');
    }

    travisAfterAll(function (result) {

        if ( result === 0 ) {
            console.log('Doing task 3...');
        }

        travisAfterAll(function (result) {
            if ( result === 0 ) {
                console.log('Doing task 4...');
            }
        });

    });

});

