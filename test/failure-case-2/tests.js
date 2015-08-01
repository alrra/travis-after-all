import path from 'path';

import getTestBranchName from './../utils/get-test-branch-name';

import testJob1 from './test-job-1';
import testJob3 from './test-job-3';
import testOtherJob from './test-other-job';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const CORRESPONDING_BRANCH_NAME = getTestBranchName(path.basename(__dirname));

// ---------------------------------------------------------------------

export default (builds) => {

    let buildData;

    builds.some((build) => {

        if ( build.branch === CORRESPONDING_BRANCH_NAME ) {
            buildData = build;
            return true;
        }

        return false;

    });

    describe(`Tests for branch ${CORRESPONDING_BRANCH_NAME} (build: ${buildData.id})`, () => {

        const JOBS = buildData.matrix;

        testJob1(JOBS);
        testOtherJob(JOBS, 2);
        testJob3(JOBS);
        testOtherJob(JOBS, 4);

    });

};
