# License and third-party rights

## Tagak project work

The project-owned source code, documentation, and directly authored practice content in this repository are licensed under the Apache License, Version 2.0. The complete license is in [`LICENSE`](LICENSE.md). The license does not grant rights to the Tagak or 타각 names, logos, or other trademarks.

This license is adopted for the repository from the revision that adds it. The public v1.0.0 release predates that change: its installers, checksums, and release notes have not been modified and do not include this new license text.

The license applies only to work the project can license. It does not replace a license, attribution, or usage condition attached to third-party material. A file's own license and credit take precedence where they identify third-party work.

## Third-party material

- Practice passages marked `CC BY-SA 4.0` remain under that license, with author, title, source, and change notes in [TEXT-LICENSES.md](TEXT-LICENSES.md) and the app's offline notice.
- Public-domain excerpts and traditional sayings keep their documented source and legal or reference context. A source link does not turn a modern quotation into an authorized passage.
- Runtime and build dependencies keep the licenses declared by their locked package metadata. The app notice lists the resolved runtime dependencies for the target platform.
- Color themes are adjusted palette references. The source projects and their licenses are listed in [docs/THEME-CREDITS.md](docs/THEME-CREDITS.md); Tagak does not claim that those projects endorse the app.
- Venice is an independent game inspired by a nostalgic typing-game experience. The app does not include the original game's code, executable, images, fonts, audio, or word database.

The offline notice is generated from its source at [`scripts/update-third-party-notices.mjs`](scripts/update-third-party-notices.mjs) and published as [`public/THIRD-PARTY-NOTICES.html`](public/THIRD-PARTY-NOTICES.html). Update the generator and regenerate the page instead of editing the generated HTML by hand.
