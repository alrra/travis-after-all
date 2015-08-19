import tap from 'tap';

import pkg from './../package.json';

import travis from './utils/travis';
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
    (travis.getBranchName()).indexOf(pkg['_configs']['test-branch-prefix']) === 0;

const jobShouldFail = () =>
    `${process.env.JOB_SHOULD_FAIL}` === 'true';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const main = async () => {

    // If this is executed from a pull request send from a forked
    // repository, do not continue any further as the tests won't
    // work because:
    //
    //  1) pull requests sent from forked repositories do not
    //     have access to the secure environment variables from
    //     this repository, and thus, the test branches cannot
    //     be automatically created
    //
    //     http://docs.travis-ci.com/user/pull-requests/#Security-Restrictions-when-testing-Pull-Requests
    //
    //  2) there is no fully secure way to automatically import
    //     code from a pull request into a local branch
    //
    //     (...and yes, I have trust issues!)

    if ( travis.isPullRequest() === true ) {
        process.exit(0);
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    if ( isTestBranch() ) {

        //  If, for testing purposes, a time delay is specified,
        //  delay the job with the specified time

        await delayJob();

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        //  Check if, for testing purposes, the current job
        //  should be made to fail, and if so, make it fail

        if ( jobShouldFail() ) {
            tap.fail('Job failed');
        }

    } else {

        tap.test('Tests', (t) => {

            // Failed builds

            testFailureAll(t)           // ( 1  1  1  1  )
            testFailureSome(t)          // ( 1  0* 0  0  )
            testFailureCURL(t)          // ( 0* 1  0  1  )
            testFailureRequire(t);      // ( 0* 0* 1  0  )
            testFailureEdge(t);         // ( 0* 0* 0* 0* )

            // Successful builds

            testSuccessAll(t);          // ( 0  0  0  0  )
            testSuccessSome(t);         // ( 0* 0  0* 0  )
            testSuccessCURL(t);         // ( 0* 0* 0  0  )
            testSuccessRequire(t);      // ( 0* 0* 0* 0  )

            t.end();

        });

    }

};

main();
