const marker = '<!-- codeforces-workbench-pr-vsix -->';
const targets = ['linux-x64', 'win32-x64', 'darwin-arm64', 'darwin-x64'];

/** Runs only from the trusted default branch, never from a PR checkout or artifact. */
export async function publishVsixComment({ github, context, core }) {
  const run = context.payload.workflow_run;
  if (run.event !== 'pull_request' || run.status !== 'completed') return;
  if (run.repository?.full_name !== `${context.repo.owner}/${context.repo.repo}`) return;
  // A workflow name alone is not sufficient to identify the build workflow.
  const { data: workflow } = await github.rest.actions.getWorkflow({
    ...context.repo,
    workflow_id: run.workflow_id,
  });
  if (workflow.path !== '.github/workflows/ci.yml') return;
  let candidates = run.pull_requests ?? [];
  // GitHub can omit this association for fork PRs.
  if (!candidates.length)
    candidates = await github.paginate(github.rest.repos.listPullRequestsAssociatedWithCommit, {
      ...context.repo,
      commit_sha: run.head_sha,
      per_page: 100,
    });
  for (const candidate of candidates) {
    const { data: pr } = await github.rest.pulls.get({
      ...context.repo,
      pull_number: candidate.number,
    });
    if (
      pr.state !== 'open' ||
      pr.base.repo.full_name !== run.repository.full_name ||
      pr.head.sha !== run.head_sha
    )
      continue;
    const comments = await github.paginate(github.rest.issues.listComments, {
      ...context.repo,
      issue_number: pr.number,
      per_page: 100,
    });
    const comment = comments.find(
      (item) => item.user?.login === 'github-actions[bot]' && item.body?.includes(marker),
    );
    // An old run or earlier attempt must not replace a newer report for the same commit.
    const previous = comment?.body?.match(/<!-- vsix-run:(\d+):(\d+) -->/);
    if (
      previous &&
      (Number(previous[1]) > run.id ||
        (Number(previous[1]) === run.id && Number(previous[2]) > run.run_attempt))
    )
      continue;
    const artifacts = await github.paginate(github.rest.actions.listWorkflowRunArtifacts, {
      ...context.repo,
      run_id: run.id,
      per_page: 100,
    });
    const runUrl = `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/actions/runs/${run.id}`;
    const rows = targets.map((target) => {
      const artifact = artifacts.find(
        (item) =>
          item.name === `codeforces-workbench-${target}` &&
          !item.expired &&
          Date.parse(item.expires_at) > Date.now(),
      );
      return `| ${target} | ${artifact ? `[Download ZIP](${runUrl}/artifacts/${artifact.id})` : 'Not available — see build logs'} |`;
    });
    const body = [
      marker,
      `<!-- vsix-run:${run.id}:${run.run_attempt} -->`,
      '### VSIX test packages',
      '',
      `Commit: \`${run.head_sha}\` · [Build logs](${runUrl}) · Result: **${run.conclusion}**`,
      '',
      '| Platform | Package |',
      '| --- | --- |',
      ...rows,
      '',
      'Sign in to GitHub to download. Extract the ZIP, then use **Extensions: Install from VSIX…** in desktop VS Code.',
      'Packages expire after 30 days. These are unreviewed PR builds for testing, not Marketplace releases.',
    ].join('\n');
    // Recheck after API calls: a new push may have changed the PR while we assembled the report.
    const { data: current } = await github.rest.pulls.get({
      ...context.repo,
      pull_number: pr.number,
    });
    if (current.state !== 'open' || current.head.sha !== run.head_sha) continue;
    if (comment)
      await github.rest.issues.updateComment({ ...context.repo, comment_id: comment.id, body });
    else await github.rest.issues.createComment({ ...context.repo, issue_number: pr.number, body });
    core.info(`Updated VSIX download report for PR #${pr.number}`);
  }
}
