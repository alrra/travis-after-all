import path from 'path';

import testJob from './../utils/test-job';
import testBuild from './../utils/test-build';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const CURRENT_TEST_DIR = path.basename(__dirname);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const tests = (testFunction, jobData) => {

    [1, 2, 3, 4, 5].forEach((i) => {
        testJob(testFunction, i, jobData, {
            assignJobNumber: 6,
            successful: false,
            successfulBuild: true,
            unsignedTasks: [1, 2, 3, 4]
        });
    });

    testJob(testFunction, 6, jobData, {
        assignJobNumber: 6,
        assignedTasks: [1, 3, 4],
        successful: true,
        successfulBuild: true,
        unsignedTasks: [2]
    });

};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default (tap) => {
    testBuild(tap, CURRENT_TEST_DIR, tests);
};
