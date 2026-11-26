# Repository guidelines

Tagak is a local typing-practice app inspired by the nostalgic Korean typing classroom experience. The current desktop development baseline is macOS 14+ with Tauri/WebKit; Windows 11 x64 with Tauri/WebView2 is also a supported desktop target. Browser execution is a development and alternate-use path.

## Sources of truth

- [docs/PROJECT-SPEC.md](docs/PROJECT-SPEC.md) owns current user behavior and product constraints.
- GitHub issues track planned work and checklists. Pull requests hold implementation scope and one-time verification. Merged pull requests and tagged releases preserve history.
- [README.md](README.md) is the English product landing page and [README.ko.md](README.ko.md) its Korean counterpart. Keep their product facts and download links aligned; put detailed help in [docs/USER-GUIDE.md](docs/USER-GUIDE.md).
- Read the documents relevant to the requested change. Update only documents affected by that change; architecture, platform evidence, development commands, and release history each have their own owner.

## Implementation

- Use functional, domain-first and type-driven design. Keep practice rules in pure functions and browser or native I/O at the boundary. Represent valid states in types and validate external data when it enters the app.
- Use domain names and small cohesive modules. Prefer clear control flow, two-space indentation, and comments that explain a constraint or reason.
- For input, scoring, sessions, content, or persistence, follow [typing-domain](.agents/skills/typing-domain/SKILL.md). For implementation and GitHub issue work, follow [typing-slice-workflow](.agents/skills/typing-slice-workflow/SKILL.md).
- When an interaction or keyboard flow is unclear, inspect the [online typing classroom](https://typing.zidell.me/) in a browser. If that observation changes Tagak's behavior, record the product contract and issue completion criterion.
- For code or runtime changes, run focused verification that covers the changed behavior. Documentation-only changes do not require app tests, builds, or CI; check their links, facts, references, and agreement with the product contract instead.

## Platform and release decisions

Stop development only when a fatal problem is reproduced on the macOS baseline and blocks installation, build, launch, or basic Korean practice. A tool limitation or unverified platform is an evidence gap: record it and continue independent work. Keep macOS baseline evidence, Windows support evidence, and browser checks distinct.

Use the repository workflow for Draft PRs, issue checklists, commits, merges, and branch cleanup. Documentation changes do not change the app version or create a release.
