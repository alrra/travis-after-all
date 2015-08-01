import path from 'path';

import copyFile from './copy-file';
import exec from './exec';
import getTestBranchName from './get-test-branch-name';
import glob from './glob';
import repository from './repository';
import travis from './travis';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const copyFiles = async (SOURCE_DIR_PATH, TARGET_DIR_PATH) => {

    const FILES = await glob('**/*', {
        cwd: SOURCE_DIR_PATH,
        dot: true,
        nodir: true
    });

    for ( let i = 0; i < FILES.length; i++ ) {
        await copyFile(
            path.join(SOURCE_DIR_PATH, FILES[i]),
            path.join(TARGET_DIR_PATH, FILES[i])
        );
    }

};

const createTestBranch = async (branchName) => {

    // Switch to test branch
    await exec(`git checkout -b ${branchName}`);

    // Commit and push changes to GitHub
    await exec(`git config --global user.email ${repository.user.EMAIL}`);
    await exec(`git config --global user.name ${repository.user.NAME}`);
    await exec('git add -A');
    await exec('git status');
    await exec('git commit --message "test"');
    await exec(`git push ${repository.URL} ${branchName}`);

    // Change back to the original branch
    await exec(`git checkout ${travis.getBranchName()}`);

};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default async (testDirNames) => {

    const ROOT_DIR = path.join(__dirname, '../../');

    for ( let i = 0; i < testDirNames.length; i++ ) {
        await copyFiles(path.join(ROOT_DIR, `test/${testDirNames[i]}/fixtures`), ROOT_DIR);
        await createTestBranch(getTestBranchName(testDirNames[i]));
    }

};
