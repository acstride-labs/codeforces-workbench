import { expect, it, vi } from 'vitest';
const scriptPath = '../../.github/scripts/pr-vsix-comment.mjs';
const { publishVsixComment } = await import(scriptPath);
function fixture() {
  const fullName = 'acstride-labs/codeforces-workbench';
  const pr = {
    number: 7,
    state: 'open',
    base: { repo: { full_name: fullName } },
    head: { sha: 'a'.repeat(40) },
  };
  const run = {
    id: 99,
    run_attempt: 1,
    workflow_id: 42,
    event: 'pull_request',
    status: 'completed',
    conclusion: 'success',
    repository: { full_name: fullName },
    head_sha: pr.head.sha,
    pull_requests: [{ number: 7 }],
  };
  const context = {
    repo: { owner: 'acstride-labs', repo: 'codeforces-workbench' },
    serverUrl: 'https://github.com',
    payload: { workflow_run: run },
  };
  const comments: any[] = [];
  const artifacts: any[] = ['linux-x64', 'win32-x64', 'darwin-arm64', 'darwin-x64'].map(
    (target, i) => ({
      id: i + 1,
      name: `codeforces-workbench-${target}`,
      expired: false,
      expires_at: '2100-01-01T00:00:00Z',
    }),
  );
  const rest = {
    actions: {
      getWorkflow: vi.fn(async () => ({ data: { path: '.github/workflows/ci.yml' } })),
      listWorkflowRunArtifacts: vi.fn(),
    },
    pulls: { get: vi.fn(async () => ({ data: pr })) },
    repos: { listPullRequestsAssociatedWithCommit: vi.fn() },
    issues: { listComments: vi.fn(), createComment: vi.fn(), updateComment: vi.fn() },
  };
  const github = {
    rest,
    paginate: vi.fn(async (method: unknown) => {
      if (method === rest.issues.listComments) return comments;
      if (method === rest.actions.listWorkflowRunArtifacts) return artifacts;
      if (method === rest.repos.listPullRequestsAssociatedWithCommit) return [{ number: 7 }];
      throw new Error('Unexpected API call');
    }),
  };
  return { run, pr, comments, artifacts, rest, github, context, core: { info: vi.fn() } };
}
it('posts four platform links bound to the exact run and commit', async () => {
  const f = fixture();
  await publishVsixComment(f);
  const call = f.rest.issues.createComment.mock.calls[0] as any[];
  expect(call[0].issue_number).toBe(7);
  expect(call[0].body).toContain(f.pr.head.sha);
  expect(call[0].body.match(/Download ZIP/g)).toHaveLength(4);
  expect(call[0].body).toContain('/actions/runs/99/artifacts/1');
  expect(call[0].body).toContain('30 days');
});
it('updates only its own bot comment and reports missing or expired packages on failure', async () => {
  const f = fixture();
  f.comments.push(
    { id: 1, user: { login: 'someone' }, body: '<!-- codeforces-workbench-pr-vsix -->' },
    {
      id: 2,
      user: { login: 'github-actions[bot]' },
      body: '<!-- codeforces-workbench-pr-vsix -->',
    },
  );
  f.run.conclusion = 'failure';
  f.artifacts[0].expired = true;
  f.artifacts[1].expires_at = '2000-01-01T00:00:00Z';
  f.artifacts.pop();
  await publishVsixComment(f);
  const call = f.rest.issues.updateComment.mock.calls[0] as any[];
  expect(call[0].comment_id).toBe(2);
  expect(call[0].body).toContain('**failure**');
  expect(call[0].body.match(/Download ZIP/g)).toHaveLength(1);
  expect(f.rest.issues.createComment).not.toHaveBeenCalled();
});
it('recovers the PR association omitted for a fork run', async () => {
  const f = fixture();
  f.run.pull_requests = [];
  await publishVsixComment(f);
  expect(f.github.paginate).toHaveBeenCalledWith(
    f.rest.repos.listPullRequestsAssociatedWithCommit,
    expect.objectContaining({ commit_sha: f.run.head_sha }),
  );
  expect(f.rest.issues.createComment).toHaveBeenCalledTimes(1);
});
it('ignores pushes, other workflows, closed PRs and obsolete commit builds', async () => {
  for (const scenario of ['push', 'workflow', 'closed', 'old-sha']) {
    const f = fixture();
    if (scenario === 'push') f.run.event = 'push';
    if (scenario === 'workflow')
      f.rest.actions.getWorkflow.mockResolvedValue({
        data: { path: '.github/workflows/other.yml' },
      });
    if (scenario === 'closed') f.pr.state = 'closed';
    if (scenario === 'old-sha') f.run.head_sha = 'b'.repeat(40);
    await publishVsixComment(f);
    expect(f.rest.issues.createComment).not.toHaveBeenCalled();
    expect(f.rest.issues.updateComment).not.toHaveBeenCalled();
  }
});
it('does not let old runs or earlier rerun attempts overwrite the latest report', async () => {
  for (const stamp of ['100:1', '99:2']) {
    const f = fixture();
    f.comments.push({
      id: 1,
      user: { login: 'github-actions[bot]' },
      body: `<!-- codeforces-workbench-pr-vsix -->\n<!-- vsix-run:${stamp} -->`,
    });
    await publishVsixComment(f);
    expect(f.rest.issues.updateComment).not.toHaveBeenCalled();
    expect(f.rest.issues.createComment).not.toHaveBeenCalled();
  }
});
it('rechecks the PR head before publishing after a concurrent push', async () => {
  const f = fixture();
  f.rest.pulls.get
    .mockResolvedValueOnce({ data: f.pr })
    .mockResolvedValueOnce({ data: { ...f.pr, head: { sha: 'b'.repeat(40) } } });
  await publishVsixComment(f);
  expect(f.rest.issues.createComment).not.toHaveBeenCalled();
});
