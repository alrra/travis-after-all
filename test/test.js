/* jshint esnext: true */

import assert from 'assert';
import crypto from 'crypto';
import https from 'https';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// Travis CI set environment variables
// http://docs.travis-ci.com/user/ci-environment/#Environment-variables

const TRAVIS_BUILD_ID = parseInt(process.env.TRAVIS_BUILD_ID, 10);
const TRAVIS_CURRENT_JOB_ID = parseInt(process.env.TRAVIS_JOB_ID, 10);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// Travis CI API URLs

const TRAVIS_API_BUILD_URL = 'https://api.travis-ci.org/builds/' + TRAVIS_BUILD_ID;
const TRAVIS_API_JOBS_URL = 'https://api.travis-ci.org/jobs/';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// Other

const CHECK_INTERVAL = 10000;

const KEYS = {
    'failure': 'travis-after-all: failed',
    'success': 'travis-after-all: succeeded'
};

// ---------------------------------------------------------------------

const allJobsAreFinished = (jobs) =>
    jobs.every((job) => job.finished_at !== null);

const generateToken = (text, key) =>
    crypto.createHmac('sha256', key).update('' + text).digest('hex');

const get = (url) =>
    new Promise((resolve, reject) => {

        https.get(url, (response) => {

            let body = '';

            response.setEncoding('utf8');
            response.on('data', (chunk) => body += chunk);
            response.on('end', () => resolve(body));

        }).on('error', (err) => {
            reject(err);
        });

    });

const getJSON = (url) =>
    get(url).then(JSON.parse).catch((err) => {
        log('Failed to parse JSON for: ' + url);
        throw err;
    });

const log = (msg) =>
    console.log('%s', msg);

async function getBuildData() {

    let jobs;

    do {

        let json;

        json = await getJSON(TRAVIS_API_BUILD_URL);
        jobs = removeCurrentJob(json.matrix);

        if ( allJobsAreFinished(jobs) ) {
            return jobs;
        }

        log('Waiting for the other jobs to finish...')
        await wait(CHECK_INTERVAL);

    } while (jobs === undefined || !allJobsAreFinished(jobs));

}

async function getJobData() {

    try {

        let jobs;

        jobs = await getBuildData();
        jobs = await getLogData(jobs);

        return jobs;

    } catch (err) {
        log(err);
        process.exit(1);
    }

}

async function getLogData(jobs) {

    for ( let job of jobs ) {
        job.log = (await getJSON(TRAVIS_API_JOBS_URL + job.id)).log;
    }

    return jobs;

}

const removeCurrentJob = (jobs) => {

    let result = [];

    jobs.forEach((job) => {
        if ( job.id !== TRAVIS_CURRENT_JOB_ID ) {
            result.push(job);
        }
    });

    return result;

};

const wait = (time) =>
    new Promise((resolve) => {
        setTimeout(resolve,time);
    });

// ---------------------------------------------------------------------

const runTests = () => {

     describe('Tests', () => {

        let jobs;

        // Get the job data
        before(() => getJobData().then((data) => jobs = data));


        describe('Tests for job 1', () => {

            it('Job should fail', () => {
                assert.equal(1, jobs[0].result);
            });

            it('Job should have the special `failure` token', () => {
                const token = generateToken(jobs[0].id, KEYS.failure);
                assert.equal(true, jobs[0].log.indexOf(token) !== -1);
            });

            it('Job should have message that job 2 was assign to do the tasks', () => {

                assert.equal(true, jobs[0].log.indexOf(`Job ${jobs[1].number} was assigned to do the \`after_all_success\` task`) !== -1);
            });

            it('Job should NOT be assign to do task 1', () => {
                assert.equal(true, jobs[0].log.indexOf('\nDoing task 1...') === -1);
            });

            it('Job should NOT be assign to do task 2', () => {
                assert.equal(true, jobs[0].log.indexOf('\nDoing task 2...') === -1);
            });

            it('Job should NOT be assign to do task 3', () => {
                assert.equal(true, jobs[0].log.indexOf('\nDoing task 3...') === -1);
            });

            it('Job should NOT be assign to do task 4', () => {
                assert.equal(true, jobs[0].log.indexOf('\nDoing task 4...') === -1);
            });


        });


        describe('Tests for job 2', () => {

            it('Job should succeed', () => {
                assert.equal(jobs[1].result, 0);
            });

            it('Job should have the special `success` token', () => {
                const token = generateToken(jobs[1].id, KEYS.success);
                assert.equal(true, jobs[1].log.indexOf(token) !== -1);
            });

            it('Job should NOT have message that job 2 was assign to do the tasks', () => {
                assert.equal(true, jobs[1].log.indexOf(`Job ${jobs[1].number} was assigned to do the \`after_all_success\` task`) === -1);
            });

            it('Job should be assign to do task 1', () => {
                assert.equal(true, jobs[1].log.indexOf('\nDoing task 1...') !== -1);
            });

            it('Job should be assign to do task 2', () => {
                assert.equal(true, jobs[1].log.indexOf('\nDoing task 2...') !== -1);
            });

            it('Job should be assign to do task 3', () => {
                assert.equal(true, jobs[1].log.indexOf('\nDoing task 3...') !== -1);
            });

            it('Job should NOT be assign to do task 4', () => {
                assert.equal(true, jobs[1].log.indexOf('\nDoing task 4...') === -1);
            });

        });


        describe('Tests for job 3', () => {

            it('Job should succeed', () => {
                assert.equal(jobs[2].result, 0);
            });

            it('Job should have the special `success` token', () => {
                const token = generateToken(jobs[2].id, KEYS.success);
                assert.equal(true, jobs[2].log.indexOf(token) !== -1);
            });

            it('Job should have message that job 2 was assign to do the tasks', () => {
                assert.equal(true, jobs[0].log.indexOf(`Job ${jobs[1].number} was assigned to do the \`after_all_success\` task`) !== -1);
            });

            it('Job should NOT be assign to do task 1', () => {
                assert.equal(true, jobs[2].log.indexOf('\nDoing task 1...') === -1);
            });

            it('Job should NOT be assign to do task 2', () => {
                assert.equal(true, jobs[2].log.indexOf('\nDoing task 2...') === -1);
            });

            it('Job should NOT be assign to do task 3', () => {
                assert.equal(true, jobs[2].log.indexOf('\nDoing task 3...') === -1);
            });

            it('Job should NOT be assign to do task 4', () => {
                assert.equal(true, jobs[2].log.indexOf('\nDoing task 4...') === -1);
            });

        });


        describe('Tests for job 4', () => {

            it('Job should succeed', () => {
                assert.equal(jobs[3].result, 0);
            });

            it('Job should have the special `success` token', () => {
                const token = generateToken(jobs[3].id, KEYS.success);
                assert.equal(true, jobs[3].log.indexOf(token) !== -1);
            });

            it('Job should have message that job 2 was assign to do the tasks', () => {
                assert.equal(true, jobs[0].log.indexOf(`Job ${jobs[1].number} was assigned to do the \`after_all_success\` task`) !== -1);
            });

            it('Job should NOT be assign to do task 1', () => {
                assert.equal(true, jobs[3].log.indexOf('\nDoing task 1...') === -1);
            });

            it('Job should NOT be assign to do task 2', () => {
                assert.equal(true, jobs[3].log.indexOf('\nDoing task 2...') === -1);
            });

            it('Job should NOT be assign to do task 3', () => {
                assert.equal(true, jobs[3].log.indexOf('\nDoing task 3...') === -1);
            });

            it('Job should NOT be assign to do task 4', () => {
                assert.equal(true, jobs[3].log.indexOf('\nDoing task 4...') === -1);
            });

        });


    });

};

// ---------------------------------------------------------------------

const main = () => {

    // Write the result of this job in its log to simulate
    // a succesfull job
    log(generateToken(TRAVIS_CURRENT_JOB_ID, KEYS.success));

    runTests();

};

main();
