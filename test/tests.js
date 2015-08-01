import assert from 'assert';
import path from 'path';

import createTestBranches from './utils/create-test-branches';
import deleteTestBranches from './utils/delete-test-branches';
import getTestBranchName from './utils/get-test-branch-name';
import glob from './utils/glob';
import repository from './utils/repository';
import travis from './utils/travis';

import testEdgeCase from './edge-case/tests';
import testFailureCase1 from './failure-case-1/tests';
import testFailureCase2 from './failure-case-2/tests';
import testSuccessCase1 from './success-case-1/tests';
import testSuccessCase2 from './success-case-2/tests';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const getBuildData = async (testDirNames) => {

    let builds = [];

    for ( let i = 0; i < testDirNames.length; i++ ) {

        const BUILD_ID = await travis.getBuildID(repository.NAME, getTestBranchName(testDirNames[i]));
        const BUILD_DATA = await travis.getFinalBuildData(BUILD_ID);

        builds.push(BUILD_DATA);

    }

    return builds;

};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default async () => {

    let builds;
    let TEST_DIRS = [];

    const DIRS = await glob('*/', {
        cwd: path.resolve(__dirname),
        ignore: 'utils',
        matchBase: true
    });

    DIRS.forEach((e) => {
        TEST_DIRS.push(path.basename(e));
    });

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    await createTestBranches(TEST_DIRS);
    builds = await getBuildData(TEST_DIRS);

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    describe('Tests', () => {

        testEdgeCase(builds);
        testFailureCase1(builds);
        testFailureCase2(builds);
        testSuccessCase1(builds);
        testSuccessCase2(builds);

        after(() => deleteTestBranches(TEST_DIRS));

    });

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // Since we do some asynchronous operations, Mocha is runned with
    // the `--delay` flag, therefore, in order for the test suite to
    // start, the special function `run()` needs to be called
    //
    // https://mochajs.org/#delayed-root-suite

    run();

};
