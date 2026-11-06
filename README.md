# Claude accounts for Wings

Choose which Claude Code account each Wings project uses. Claude Code keeps an account in its own config folder, picked by `CLAUDE_CONFIG_DIR`: `~/.claude` is the default account and `~/.claude-<name>` is another one. This plugin sets that per project, so a terminal opened in "web" starts Claude with one account and a terminal in "api" with another, with no `export` to remember.

Adds a button to the Wings title bar that opens Claude accounts in the right sidebar. At the top is the project on screen and a picker for its account, labelled with the account's email when Claude Code knows it, else its name (Default for `~/.claude`). Under it, every account with its email or "Not signed in", the projects that use it, and "This project" on the one this project has.

Point at the button, or tab to it, and a popover shows the same picker without opening the sidebar.

Only new terminals use the account you pick. Claude sessions that are already open keep theirs, so after a switch the plugin says so and offers Open Claude, which opens a new terminal running `claude` in the project.

## Start Claude as another account

Under the picker, Start Claude as has a button for each account the project doesn't use. It opens a new terminal in the project running `claude` as that account, and leaves the project's own account as it is. Handy for a quick session on your other account without switching the project and back.

## Use my default setup

Each named account has a Use my default setup box, on until you turn it off. On, the account uses your default account's settings, plugins, skills and rules: Wings links `settings.json`, `CLAUDE.md` and the other Markdown files, `rules`, `skills`, `agents`, `commands`, `hooks`, `output-styles`, `plugins` and the status line scripts from `~/.claude` into the account's folder, and copies your default MCP servers into it. The account's sign-in, sessions and history stay its own. What the account had at those names is moved to `.before-shared-setup/` in its folder and comes back when you turn the box off. Wings applies it each time it connects to the account, so an account you made before gets it the next time you use it.

## Add an account

Add account asks for a short name (lowercase letters, digits and dashes, up to 32, like `work`). Wings makes `~/.claude-<name>` with your default setup, the project switches to the new account, and `claude` opens in a new terminal in the project. Claude Code walks you through signing in the first time it runs in a new config folder. The other projects keep the account they have.

The list refreshes when Wings comes to the front and when the popover opens, so an account you signed in to in a terminal shows with its email the next time you look.

## Install

The code is TypeScript and React in `src/`, built with [wings-plugin-sdk](https://www.npmjs.com/package/wings-plugin-sdk); the repo holds only source. Build the package:

```sh
npm install
npm run check   # type-checks, then writes claude-accounts.wings-plugin
```

Drop `claude-accounts.wings-plugin` on the Wings window, or pick it under Plugins, Choose a file, then turn it on in Plugins. It asks for the Claude accounts permission, and to open `claude` in a terminal.

It needs Wings 0.1.121. `src/claude-accounts.d.ts` types the Wings calls it uses, `wings.claudeAccounts()`, `wings.setClaudeAccount()`, `wings.shareClaudeSetup()` and `claudeAccount` in `wings.openPane()`, until `wings-plugin-sdk` ships them.

## Release

Bump `version` in `wings-plugin.json`, commit, and push a matching tag like `v0.2.0`. The workflow builds the plugin, packs it, and attaches `claude-accounts.wings-plugin` to a GitHub release.
