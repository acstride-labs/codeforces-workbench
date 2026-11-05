# CI status checks

CI check names identify the package target, independently of the GitHub runner image:

| Required check         | Build target        | Current runner   |
| ---------------------- | ------------------- | ---------------- |
| `check (linux-x64)`    | Linux x64           | `ubuntu-22.04`   |
| `check (win32-x64)`    | Windows x64         | `windows-latest` |
| `check (darwin-arm64)` | macOS Apple Silicon | `macos-15`       |
| `check (darwin-x64)`   | macOS Intel         | `macos-15-intel` |

Future runner upgrades change `matrix.os`, not the check names. CI still builds and tests all four targets.

## Migrate required checks

After the new checks appear on the migration PR, a repository administrator must update the active branch protection rule or ruleset for `master`:

1. Add all four check names from the table, using GitHub Actions as the source.
2. Remove the four old OS-version-based names, including `check (macos-14, darwin-arm64)`.
3. Save the rule and verify that the PR reports these four checks as required.

Make the replacement in one settings edit; do not disable required checks or bypass a failed build. Without this update, GitHub continues to wait for old check names even when the new builds pass. The GitHub UI may display a workflow/event prefix around these check names.
