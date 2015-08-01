import runTests from './tests';
import travis from './utils/travis';
import wait from './utils/wait';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const delayJob = async () => {

    const TIME_DELAY = parseInt(process.env.TIME_DELAY, 10);

    if ( ! Number.isNaN(TIME_DELAY) ) {
        await wait(TIME_DELAY * 1000);
    }

};

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

    //  Check if, for testing purposes, the current job
    //  should be made to fail, and if so, make it fail

    if ( jobShouldFail() ) {
        process.exit(1);
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    //  If, for testing purposes, a time delay is specified,
    //  delay the job with the specified time

    await delayJob();

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    runTests();

};

main();
