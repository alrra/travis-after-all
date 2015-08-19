import exec from './exec';
import getTestBranchName from './get-test-branch-name';
import repository from './repository';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default async (branchName) => {
    await exec(`git push ${repository.ORIGIN_URL} :${branchName}`);
};
