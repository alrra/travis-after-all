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

            testFailureAll(t)           // ( 1  1  1  1  1  1  )
            testFailureSome(t)          // ( 0  0* 0  1  0  0  )
            testFailureCURL(t)          // ( 0* 1  0  1  0  0  )
            testFailureRequire(t);      // ( 0* 0* 1  0  0  1  )
            testFailureEdge(t);         // ( 0* 0* 0* 0* 0* 0* )

            // Successful builds

            testSuccessAll(t);          // ( 0  0  0  0  0  0  )
            testSuccessSome(t);         // ( 0* 0  0* 0  0* 0  )
            testSuccessCURL(t);         // ( 0* 0* 0* 0  0  0  )
            testSuccessRequire(t);      // ( 0* 0* 0* 0* 0* 0  )

            t.end();

        });

    }

};

main();
