var crypto = require('crypto');
var https = require('https');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// Travis CI set environment variables
// http://docs.travis-ci.com/user/ci-environment/#Environment-variables

var TRAVIS_BUILD_ID = parseInt(process.env.TRAVIS_BUILD_ID, 10);
var TRAVIS_CURRENT_JOB_ID = parseInt(process.env.TRAVIS_JOB_ID, 10);
var TRAVIS_CURRENT_JOB_TEST_RESULT = parseInt(process.env.TRAVIS_TEST_RESULT, 10);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// Travis CI API URLs

var TRAVIS_API_BUILD_URL = 'https://api.travis-ci.org/builds/' + TRAVIS_BUILD_ID;
var TRAVIS_API_JOBS_URL = 'https://api.travis-ci.org/jobs/';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// Other

var CHECK_INTERVAL_LIMIT = 60000;
var checkInterval = 5000;

var KEYS = {
    'failure': 'travis-after-all: failed',
    'success': 'travis-after-all: succeeded'
};

var LOG_PREFIX='[travis-after-all]';

// ---------------------------------------------------------------------

function allJobsPassed(jobs) {
    return jobs.every(function (job) {
        return jobPassed(job);
    });
}

function generateToken(text, key) {
    return crypto.createHmac('sha256', key).update('' + text).digest('hex');
}

function getFirstSuccessfulJob(jobs) {

    var i = 0;
    var numberOfJobs = jobs.length;

    for ( i = 0; i < numberOfJobs; i++ ) {
        if ( jobs[i].result === 0 ) {
            return jobs[i];
        }
    }

    return undefined;

}

function getJSON(url, callback) {

    https.get(url, function(response) {

        var body = '';

        response.setEncoding('utf8');

        response.on('data', function (chunk) {
            body += chunk;
        });

        response.on('end', function () {
            callback(parseJSON(body));
        });

    }).on('error', function (e) {

        log('Error: ' + e.message);
        process.exit(2);

    });

}

function getJobNumbersOfUndoneJobs(jobs) {

    var undoneJobs = [];

    jobs.forEach(function (job) {
        if ( job.result === null ) {
            undoneJobs.push(job.number);
        }
    });

    return undoneJobs;

}

function getResults(jobList) {

    var currentJob;
    var undoneJobs;

    if ( jobList.index < jobList.jobs.length ) {

        currentJob = jobList.jobs[jobList.index];
        jobList.index++;


        // The `result` of a job is only set after the job is finished,
        // so, if the value of `result` is different from `null`, it
        // means that it was extracted from its log, and thus, there is
        // no need to check the log again

        if ( currentJob.result !== null ) {
            getResults(jobList);

        // Also, there is no need to check the log for the current job

        } else if ( currentJob.id === TRAVIS_CURRENT_JOB_ID ) {
            currentJob.result = TRAVIS_CURRENT_JOB_TEST_RESULT;
            getResults(jobList);

        // In all other cases, check the job's log for the result

        } else {

            getJSON(TRAVIS_API_JOBS_URL + currentJob.id, function (data) {

                var jobLog = data.log;

                // If written, get the result of the job from
                // the special token written within the job's log

                if ( jobLog.indexOf(generateToken(currentJob.id, KEYS.success)) !== -1 ) {
                    currentJob.result = 0;
                } else if ( jobLog.indexOf(generateToken(currentJob.id, KEYS.failure)) !== -1 ) {
                    currentJob.result = 1;
                }

                getResults(jobList);

            });

        }

    } else {

        undoneJobs = getJobNumbersOfUndoneJobs(jobList.jobs);


        // If there are jobs that are not yet done, wait
        // a bit, and then check again for their result

        if ( undoneJobs.length !== 0 ) {

             log('Waiting for ' + undoneJobs.join(', ').replace(/,(?!.*,)/, ' and') + ' to be done...');

             jobList.index = 0;

             // If the jobs take longer to be done, gradually increase
             // the check interval time up to the specified limit

             checkInterval = ( checkInterval * 2 > CHECK_INTERVAL_LIMIT ?
                                    CHECK_INTERVAL_LIMIT : checkInterval * 2 );

             setTimeout(function () {
                 getResults(jobList);
             }, checkInterval);


        // If all jobs are done, make this script
        // return with the appropriate exit code

        } else {
            returnWithAppropriateExitCode(jobList.jobs);
        }

    }

}

function jobPassed(job) {

    // A job passed if it either succeeded or it has failed but
    // it was allowed to fail (has `allow_failure` set to true)
    //
    // http://docs.travis-ci.com/user/build-configuration/#Rows-That-are-Allowed-To-Fail

    return job.result === 0 || ( job.result === 1 && job.allow_failure === true );

}

function log(msg) {
    console.log('%s %s', LOG_PREFIX, msg);
}

function logJobResult(job) {

    var msg = '';
    var token;


    // Write a special token generated based on the result of
    // the job so that the chance of that text existing in the
    // log is minimal / non-existent.

    if ( TRAVIS_CURRENT_JOB_TEST_RESULT === 0 ) {
        token = generateToken(TRAVIS_CURRENT_JOB_ID, KEYS.success);
        msg += 'Job succeeded (' + token + ')';
    } else {
        token = generateToken(TRAVIS_CURRENT_JOB_ID, KEYS.failure);
        msg += 'Job failed (' + token + ')';
    }


    // If the token is already present in the log, don't write
    // it again (this is done in order to reduce the output in
    // the case where this script is executed multiple times -
    // e.g.: the user uses multiple scripts that include this
    // script)

    if ( job.log.indexOf(token) === -1 ) {
        log(msg);
    }

}

function parseJSON(data) {

    var json = '';

    try {
        json = JSON.parse(data);
    } catch (e) {
        log('Failed to parse JSON (' + e + ')');
        log('Data: "' + data + '"');
        process.exit(2);
    }

    return json;

}

function returnWithAppropriateExitCode(jobs) {

    // Convention for exit codes
    //
    //    0 - if the current job is the one assign to execute the
    //        `after_all_success` tasks
    //
    //    1 - if the current job is the one assign to execute the
    //        `after_all_failure` tasks
    //
    //    2 - none of the above
    //

    var firstJob = jobs[0];
    var firstSuccesfulJob = getFirstSuccessfulJob(jobs);


    if ( allJobsPassed(jobs) &&

            // Even if all jobs passed we still need to check if there
            // is at least one successful job (this guards against the
            // rare case where all jobs are allowed to fail and they do
            // fail)

            firstSuccesfulJob !== undefined ) {

        if ( firstSuccesfulJob.id !== TRAVIS_CURRENT_JOB_ID ) {
            log('Job ' + firstSuccesfulJob.number + ' was assigned to do the `after_all_success` task');
            process.exit(2);
        } else {
            process.exit(0);
        }

    } else {

        if ( firstJob.id !== TRAVIS_CURRENT_JOB_ID )  {
            log('Job ' + firstJob.number + ' was assigned to do the `after_all_failure` task');
            process.exit(2);
        } else {
            process.exit(1);
        }

    }

}

// ---------------------------------------------------------------------

function main() {

    // Write the result of this job in its log if it isn't written
    // already (this needs to be done because there isn't any other
    // way for the other jobs to know the result of this job without
    // it actually be finished)

    getJSON(TRAVIS_API_JOBS_URL + TRAVIS_CURRENT_JOB_ID, logJobResult);


    // Get the list of jobs for this build, and start checking for
    // their results

    getJSON(TRAVIS_API_BUILD_URL, function (data) {
        getResults({
            index: 0,
            jobs: data.matrix
        });
    });

}

main();
