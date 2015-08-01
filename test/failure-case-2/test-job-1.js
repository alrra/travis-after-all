import assert from 'assert';

import pkg from './../../package.json';

import generateSHA256 from './../utils/sha256';
import travis from './../utils/travis';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const KEYS = pkg['_configs'].keys;

// ---------------------------------------------------------------------

export default (jobList) => {

    const JOB_NUMBER = 1;

    describe(`Tests for Job ${JOB_NUMBER} (${jobList[JOB_NUMBER - 1].id})`, () => {

        let jobData;

        before(async () => {
            jobData = await travis.getFinalJobData(jobList[JOB_NUMBER - 1].id);
        });

        it('Job should succeed', () => {
            assert.equal(0, jobData.result);
        });

        it('Job should have the special `success` token', () => {
            const token = generateSHA256(jobData.id, KEYS.success);
            assert.equal(true, jobData.log.indexOf(token) !== -1);
        });

        it('Job should NOT have message that Job 1 was assign to do the tasks', () => {
            assert.equal(false, jobData.log.indexOf(`Job ${jobList[0].number} was assigned to do the \`after_all_failure\` task`) !== -1);

        });

        [1, 3, 4].forEach((i) => {
            it(`Job should NOT be assign to do task ${i}`, () => {
                assert.equal(false, jobData.log.indexOf(`\nDoing task ${i}...`) !== -1);
            });
        });

        [2].forEach((i) => {
            it(`Job should be assign to do task ${i}`, () => {
                assert.equal(true, jobData.log.indexOf(`\nDoing task ${i}...`) !== -1);
            });
        });

    });

};
