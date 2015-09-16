import path from 'path';

import testBuild from './../utils/test-build';
import testJob from './../utils/test-job';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const CURRENT_TEST_DIR = path.basename(__dirname);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const tests = (testFunction, jobData) => {

    testJob(testFunction, 1, jobData, {
        assignJobNumber: 1,
        assignedTasks: [2],
        successful: false,
        successfulBuild: false,
        unsignedTasks: [1, 3, 4]
    });

    [2, 3, 6].forEach((i) => {
        testJob(testFunction, i, jobData, {
            assignJobNumber: 1,
            successful: false,
            successfulBuild: false,
            unsignedTasks: [1, 2, 3, 4]
        });
    });

    [4, 5].forEach((i) => {
        testJob(testFunction, i, jobData, {
            assignJobNumber: 1,
            successful: true,
            successfulBuild: false,
            unsignedTasks: [1, 2, 3, 4]
        });
    });

};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default (tap) => {
    testBuild(tap, CURRENT_TEST_DIR, tests);
};
