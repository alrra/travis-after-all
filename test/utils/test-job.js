import pkg from './../../package.json';

import generateSHA256 from './../utils/sha256';
import travis from './../utils/travis';

import wait from './../utils/wait';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const KEYS = pkg['_configs'].keys;

// ---------------------------------------------------------------------

export default (tap, jobNumber, jobList, configs) => {

    tap.test(`Tests for Job ${jobNumber} (id: ${jobList[jobNumber- 1].id})`, async (t) => {

        const JOB_DATA = await travis.getFinalJobData(jobList[jobNumber- 1].id);

        const FAILURE_TOKEN = generateSHA256(JOB_DATA.id, KEYS.failure);
        const SUCCESS_TOKEN = generateSHA256(JOB_DATA.id, KEYS.success);

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        if ( configs.successful === true ) {
            t.equal(0, JOB_DATA.result, 'Job should succeed');
        } else {
            t.notEqual(0, JOB_DATA.result, 'Job should fail');
        }

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        if ( configs.successful === true ) {
            t.ok(JOB_DATA.log.indexOf(SUCCESS_TOKEN) !== -1, 'Job should have the special `success` token');
        } else {
            t.ok(JOB_DATA.log.indexOf(FAILURE_TOKEN) !== -1, 'Job should have the special `failure` token');
        }

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        if ( configs.assignJobNumber !== jobNumber ) {
            t.ok(JOB_DATA.log.indexOf('Some other job was assigned to do the task') !== -1 ,`Job should have message that 'Some other job was assigned to do the task'`);
        } else {
            t.notOk(JOB_DATA.log.indexOf('Some other job was assigned to do the task') !== -1 ,`Job should have message that 'Some other job was assigned to do the task'`);
        }

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        if ( configs.assignedTasks !== undefined ) {
            configs.assignedTasks.forEach((i) => {
                t.ok(JOB_DATA.log.match(new RegExp(`[^"']Doing task ${i}...`)) !== null, `Job should be assign to do task ${i}`);
            });
        }

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        if ( configs.unsignedTasks !== undefined ) {
            configs.unsignedTasks.forEach((i) => {
                t.notOk(JOB_DATA.log.match(new RegExp(`[^"']Doing task ${i}...`, 'm')) !== null, `Job NOT should be assign to do task ${i}`);
            });
        }

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        t.end();

    });

};
