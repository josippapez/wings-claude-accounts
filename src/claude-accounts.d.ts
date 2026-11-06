// Goes once wings-plugin-sdk ships these types: Wings' Claude accounts API (Wings 0.1.120, 0.1.121 and 0.1.123), merged into the SDK's global `Wings`.
interface Wings {
  /**
   * `name: null` is the default account, `~/.claude`. `projects` maps a project id to its account's name; a project that isn't there uses the default.
   * `email` is who the account's config names; it stays after the sign-in is gone. `signedIn` is what `claude auth status` says for the account (Wings 0.1.123; before it, a hint read from the config), and
   * `authMethod` how it says the account signs in, as it prints it: "claude.ai", or "none" while signed out (Wings 0.1.123). Both say not signed in when `claude` is missing.
   * `sharesSetup` is whether the account uses the default account's settings, plugins, skills and rules (Wings 0.1.121): true until turned off, always false for the default account.
   */
  claudeAccounts(): Promise<{
    accounts: { name: string | null; dir: string; email: string | null; signedIn: boolean; authMethod: string | null; sharesSetup: boolean }[];
    projects: Record<string, string>;
  }>;
  /** Sets the account the project's new terminals use (`null` for the default); Wings makes `~/.claude-<name>`. Terminals already open keep theirs. */
  setClaudeAccount(projectId: string, name: string | null): Promise<void>;
  /**
   * Turns on or off that the named account uses the default account's setup (Wings 0.1.121): `*.md` files, rules, skills, agents, commands, hooks, output styles,
   * plugins and scripts become links to the default account's, and `settings.json` becomes a copy of the default's that keeps the account's own `model`.
   * What the account had is kept in `.before-shared-setup/` and comes back when it is turned off.
   */
  shareClaudeSetup(name: string, on: boolean): Promise<void>;
  /** `openPane` with `claudeAccount` (Wings 0.1.121): runs the terminal under that account, or the default account with `null`, whatever the project uses. */
  openPane(options: { command?: string; args?: string[]; cwd?: string; placement?: "tab" | "right" | "down"; focus?: boolean; claudeAccount?: string | null }): Promise<{ paneId: string }>;
}
