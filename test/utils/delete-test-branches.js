import exec from './exec';
import getTestBranchName from './get-test-branch-name';
import repository from './repository';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default async (testDirNames) => {
    for ( let i = 0; i < testDirNames.length; i++ ) {
        await exec(`git push ${repository.URL} :${getTestBranchName(testDirNames[i])}`);
    }
};
