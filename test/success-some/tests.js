import path from 'path';

import testBuild from './../utils/test-build';
import testJob from './../utils/test-job';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const CURRENT_TEST_DIR = path.basename(__dirname);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const tests = (testFunction, jobData) => {

    [1, 3, 5].forEach((i) => {
        testJob(testFunction, i, jobData, {
            assignJobNumber: 2,
            successful: false,
            successfulBuild: true,
            unsignedTasks: [1, 2, 3, 4]
        });
    });

    testJob(testFunction, 2, jobData, {
        assignJobNumber: 2,
        assignedTasks: [1, 3, 4],
        successful: true,
        successfulBuild: true,
        unsignedTasks: [2]
    });

    [4, 6].forEach((i) => {
        testJob(testFunction, i, jobData, {
            assignJobNumber: 2,
            successful: true,
            successfulBuild: true,
            unsignedTasks: [1, 2, 3, 4]
        });
    });

};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default (tap) => {
    testBuild(tap, CURRENT_TEST_DIR, tests);
};
