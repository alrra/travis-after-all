import tap from 'tap';

import pkg from './../package.json';

import * as travis from './utils/travis';
import wait from './utils/wait';

import testFailureAll from './failure-all/tests';
import testFailureCURL from './failure-curl/tests';
import testFailureEdge from './failure-edge/tests';
import testFailureRequire from './failure-require/tests';
import testFailureSome from './failure-some/tests';
import testSuccessAll from './success-all/tests';
import testSuccessCURL from './success-curl/tests';
import testSuccessRequire from './success-require/tests';
import testSuccessSome from './success-some/tests';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const delayJob = async () => {

    const TIME_DELAY = parseInt(process.env.TIME_DELAY, 10);

    if ( ! Number.isNaN(TIME_DELAY) ) {
        await wait(TIME_DELAY * 1000);
    }

};

const isTestBranch = () =>
    (travis.getBranchName()).indexOf(pkg['config']['test-branch-prefix']) === 0;

const jobShouldFail = () =>
    `${process.env.JOB_SHOULD_FAIL}` === 'true';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const main = async () => {

    if ( travis.isPullRequest() === true ) {
        process.exit(0);
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    if ( isTestBranch() ) {

        //  If, for testing purposes, a time delay is specified,
        //  delay the job with the specified time.

        await delayJob();

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        //  Check if, for testing purposes, the current job should
        //  be made to fail, and if so, make it fail.

        if ( jobShouldFail() ) {
            tap.fail('Job failed');
        }

    } else {

        tap.test('Tests', (t) => {

            // Failed builds

            testFailureAll(t);
            testFailureSome(t);
            testFailureCURL(t);
            testFailureRequire(t);
            testFailureEdge(t);

            // Successful builds

            testSuccessAll(t);
            testSuccessSome(t);
            testSuccessCURL(t);
            testSuccessRequire(t);

            t.end();

        });

    }

};

main();
