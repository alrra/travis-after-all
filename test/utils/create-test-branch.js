import path from 'path';

import copyFile from './copy-file';
import exec from './exec';
import getTestBranchName from './get-test-branch-name';
import glob from './glob';
import repository from './repository';
import travis from './travis';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const createTestBranch = async (branchName) => {

    // Switch to test branch
    await exec(`git checkout -b ${branchName}`);

    // Commit and push changes to GitHub
    await exec(`git config --global user.email ${repository.user.EMAIL}`);
    await exec(`git config --global user.name ${repository.user.NAME}`);
    await exec('git add -A');
    await exec('git status');
    await exec('git commit --message "Test"');
    await exec(`git push ${repository.ORIGIN_URL} ${branchName}`);

    // Change back to the original branch
    await exec(`git checkout ${travis.getBranchName()}`);

};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default async (testDirName) => {

    const ROOT_DIR = path.join(__dirname, '../../');

    await copyFile(
        path.join(ROOT_DIR, `test/${testDirName}/fixtures/.travis.yml`),
        path.join(ROOT_DIR, '.travis.yml')
    );

    await createTestBranch(getTestBranchName(testDirName));

};
