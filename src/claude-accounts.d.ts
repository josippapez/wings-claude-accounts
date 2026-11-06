// Goes once wings-plugin-sdk ships these types: Wings' Claude accounts API, merged into the SDK's global `Wings`.
interface Wings {
  /** `name: null` is the default account, `~/.claude`. `projects` maps a project id to its account's name; a project that isn't there uses the default. */
  claudeAccounts(): Promise<{ accounts: { name: string | null; dir: string; email: string | null; signedIn: boolean }[]; projects: Record<string, string> }>;
  /** Sets the account the project's new terminals use (`null` for the default); Wings makes `~/.claude-<name>`. Terminals already open keep theirs. */
  setClaudeAccount(projectId: string, name: string | null): Promise<void>;
}
