# Codeforces Workbench

**Read the problem. Write the solution. Run the tests. Stay in VS Code.**

Codeforces Workbench is a desktop VS Code extension for importing Codeforces contests and individual problems, testing solutions locally, and following official results. It also supports local practice problems and optional AI assistance.

Part of [AC-Stride](https://github.com/acstride-labs), alongside [Codeforces Client](https://github.com/acstride-labs/codeforces-client) and the [product website](https://acstride.com/en).

[![CI](https://github.com/acstride-labs/codeforces-workbench/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/acstride-labs/codeforces-workbench/actions/workflows/ci.yml)

[Get started](#get-started) · [Features](#features) · [AI assistance](#ai-assistance) · [Development](#development) · [Report an issue](https://github.com/acstride-labs/codeforces-workbench/issues)

> Preview software. This README describes the current source tree; published packages may have fewer features. Codeforces sign-in and automatic submission are experimental.

## Features

- **A workbench for each problem.** Read statements with rendered mathematics, edit code in the native VS Code editor, and run official samples or your own tests.
- **Contests, single problems, or local practice.** Import a whole contest, add one Codeforces problem, or create a problem without connecting to Codeforces.
- **Four solution languages.** Use C++, Python, Java, or Kotlin, with separate source files for each language and shared test cases.
- **Useful local verdicts.** See AC, WA, runtime errors, timeouts, compilation errors, output limits, and the first differing output token. Run one case or all cases.
- **Codeforces context.** Follow contest countdowns, rankings, and public submission results. Copy a solution for manual submission or use the experimental authenticated submission flow.
- **Optional AI tools.** Translate statements, reveal progressive hints, review your code, or generate a reference solution using your own OpenAI-compatible provider.

The interface supports **English, 简体中文, Русский, and 日本語**. Interface language and AI response language can be configured separately.

## Get started

### 1. Install the extension

Use **desktop VS Code 1.95 or newer**. In this repository's **Releases** page, choose the VSIX matching your operating system and CPU:

| Your system                      | Package target |
| -------------------------------- | -------------- |
| Windows x64                      | `win32-x64`    |
| macOS Apple Silicon              | `darwin-arm64` |
| macOS Intel                      | `darwin-x64`   |
| Linux x64, glibc / Ubuntu 22.04+ | `linux-x64`    |

In VS Code, open the Command Palette and run **Extensions: Install from VSIX…**, then select the package. Other architectures, Alpine/musl, and browser-based VS Code are not supported.

Public problem imports use the bundled Codeforces Client and downloader. You do not need to install Go or a separate Python runtime to read problems.

### 2. Set up your solution language

Open a single local folder and trust the workspace to compile or run code. Open **AC-Stride: Settings**, choose your default language under **Coding settings**, and configure the tools you use:

| Language | Local tools                                  |
| -------- | -------------------------------------------- |
| C++      | A C++20 compiler, such as `g++` or `clang++` |
| Python   | Python 3, normally `python3`                 |
| Java     | A JDK; version 17 or newer is recommended    |
| Kotlin   | The standalone Kotlin compiler and a JDK     |

Run the relevant **Environment checks** in Settings to confirm that your compiler or interpreter works. These tools run your solutions; they are separate from the bundled problem downloader.

### 3. Try your first problem

For a quick offline check:

1. Run **AC-Stride: Create Local Problem** from the Command Palette.
2. Enter an ID and title. The default template reads two integers and prints their sum.
3. Select **Run all**. The starter test `2 3 → 5` should pass.
4. Change the expected output to `6` and rerun to see a WA result and the differing token.

Use **Ctrl+Alt+R** on Windows/Linux or **Cmd+Alt+R** on macOS to run tests from a solution file.

## Work with Codeforces

Open the **AC-Stride** sidebar. Its three lists keep contests, individual Codeforces problems, and local practice separate.

### Import a contest or a problem

- In **Codeforces Contests**, select **+** and enter a contest URL or numeric ID.
- In **Codeforces Problems**, select **+** and enter a problem URL or an ID such as `2261A`.
- Select a downloaded problem to open its statement, source file, and tests. For a contest, use the problem buttons to move between tasks.

Released statements and samples download automatically. For an upcoming contest, keep VS Code open through its start. Downloads retry on failure; selecting a failed problem starts another attempt. You can continue with saved statements and local tests while Codeforces is unavailable.

Imports preserve existing solution files. Contest files live under `contests/`, individual Codeforces problems under `codeforces-problems/`, and workspace metadata under `.codeforces-workbench/`.

### Write and test

Switch languages with **AC-Stride: Switch Solution Language**. Each language keeps its own source file. Customize starter code under **Settings → Coding settings**; templates apply when a source file is first created.

Official samples are read-only. Add a custom test with **+**, save test edits, then run one case or all cases. Clear the expected-output option for a run-only case; an enabled but empty expected output means that the program should print nothing.

The checker compares whitespace-separated tokens, preserving case and numeric spelling. Local AC is not official Codeforces acceptance: memory is not measured, timings differ from the judge, and floating-point or special-judge problems may need different checking rules. Solutions execute on your machine without a security sandbox.

### Submit and follow results

**Copy code and open submission** saves the selected solution, copies it, and opens the official submission page for manual submission.

**One-click submit** requires signing in through Settings. It asks you to select an official language and confirm the account, problem, and source before sending. If a submission's status is uncertain, check Codeforces before trying again; unknown submissions are not automatically resent.

Sign-in and automatic submission have not been verified against a real account. Site verification or 2FA may prevent them. Public problem downloads and rankings do not require signing in.

## AI assistance

AI tools are optional. Under **Settings → AI assistance**, enter your provider's OpenAI-compatible Base URL, model name, and API key if required, then select **Test connection**. Keys are stored in VS Code SecretStorage and bound to the configured endpoint.

| Tool                  | What it does                                              | Data sent to your provider                                     |
| --------------------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| Statement translation | Translates the problem into your selected language        | Original statement HTML                                        |
| AI Hint               | Generates progressive hints, hidden until you reveal them | Original statement and selected solution language              |
| AI Debug              | Explains possible issues without replacing your code      | Original statement and current source, including unsaved edits |
| AI Solution           | Generates reference code in the selected language         | Original statement and selected solution language              |

Translation is disabled by default. You can enable automatic translation after import, customize prompts and response languages, and configure the shared response cache. Debug and Solution stream answer text when supported by the provider; Hint, Debug, and Solution requests have a 300-second total timeout.

Generated code is for review and testing. The extension does not overwrite your source or automatically submit AI output. Use AI tools for practice and follow each contest's rules.

## Troubleshooting

| Problem                                        | What to check                                                                                                              |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| A compiler or interpreter cannot be found      | Check its executable path in Settings, then run the corresponding environment check.                                       |
| Problems do not download                       | Check network access and Codeforces availability, then select the problem to retry. Existing code and tests remain usable. |
| A bundled component is missing or incompatible | Reinstall the VSIX for your OS and CPU. Components are supplied with the extension package.                                |
| Tests show WA despite similar output           | Check the first differing token. Whitespace is ignored; case and numeric spelling are significant.                         |
| An AI request fails                            | Test the configured endpoint, model, and credentials. Provider errors and timeouts can be retried.                         |
| A submission has an unknown result             | Check the official website before sending it again.                                                                        |

To report a bug, open an [issue](https://github.com/acstride-labs/codeforces-workbench/issues) with your extension version, OS/CPU, reproduction steps, and relevant diagnostics. Remove credentials and private source code before sharing logs.

## Development

For native builds, use a supported target OS with **Node.js 24**, **Go 1.26+**, and **Python 3.10+**; CI uses Python 3.12. Install a C++ compiler, JDK 17+, and Kotlin compiler to exercise all solution runners. CI uses Kotlin 2.2.0.

```sh
git clone https://github.com/acstride-labs/codeforces-workbench.git
cd codeforces-workbench
npm ci
npm run build:codeforces-client
npm run build:downloader
npm run check
```

The two native build steps fetch the pinned client source and generate the bundled executables. They require network access. `npm run check` runs type checks, automated tests, release-policy tests, and the extension/Webview build. Live Codeforces tests are skipped by default.

Open the repository in desktop VS Code and press **F5** to launch **Run AC-Stride Extension** in an Extension Development Host. Build the native bundles first; the launch configuration rebuilds the extension code.

To create and verify a platform-specific installation package:

```sh
npm run package
npm run verify:vsix
```

PR CI builds packages for all four platforms. After a build finishes, `github-actions[bot]` updates a comment on the PR with the commit, build result, and available test packages. GitHub sign-in is required to access artifacts, which are retained for 30 days. These are test builds and are not published to Marketplace. Fork PRs may need maintainer approval before CI runs.

Useful references:

- [Native bundle builds and verification](packaging/README.md)
- [Manual end-to-end checks](test/MANUAL.md)
- [Localization and settings](docs/localization-and-settings.md)
- [Release and publishing guide](docs/RELEASING.md)
- [Changelog](CHANGELOG.md)

For contributions, describe the problem, include reproduction steps or relevant tests, and explain how you validated the change. Keep generated native bundles and local build output out of commits.

## License

This repository is source-available, with **all rights reserved**. It is not distributed under an open-source license; see [LICENSE](LICENSE). Bundled third-party components retain their respective licenses and notices.
