// The accounts Wings knows, the projects that use them, and the names an account may have.

import { useEffect, useMemo, useState } from "react";

import { errorMessage, singleFlight } from "wings-plugin-sdk/async";

import { ch } from "./messages";

export type Account = Awaited<ReturnType<Wings["claudeAccounts"]>>["accounts"][number];
type Project = Awaited<ReturnType<Wings["projects"]>>[number];

/** Everything the pages show: the accounts, which account each project has (absent: the default), and the projects. */
export interface Loaded {
  accounts: Account[];
  assigned: Record<string, string>;
  projects: Project[];
}

/** The account a project uses: its name, or `null` for the default. */
export function accountOf(data: Loaded, projectId: string): string | null {
  return data.assigned[projectId] ?? null;
}

/** What a picker and a message call an account: its email when known, else its name, and "Default" for `~/.claude`. */
export function accountLabel(account: Account): string {
  if (!account.email) return account.name ?? "Default";
  return `${account.email} (${account.name ?? "default"})`;
}

/** The names of the projects that use `account`. */
export function projectsUsing(data: Loaded, account: Account): string[] {
  return data.projects.filter((p) => accountOf(data, p.id) === account.name).map((p) => p.name);
}

/** What Wings accepts as an account's name. */
const NAME = /^[a-z0-9][a-z0-9-]{0,31}$/;

/** Why `name` can't be an account's name, or `null` when it can. */
export function nameProblem(name: string, existing: Account[]): string | null {
  if (name.length > 32) return "Use 32 characters or fewer.";
  if (!/^[a-z0-9-]+$/.test(name)) return "Use only lowercase letters, digits and dashes.";
  if (!NAME.test(name)) return "Start with a letter or a digit.";
  if (existing.some((a) => a.name === name)) return `There is an account called ${name} already.`;
  return null;
}

/**
 * The accounts and projects, loaded when the page mounts if Wings is in the background, and whenever Wings comes to the
 * front (which is also when a popover is shown again) or the other page changed something. `reload` loads them now.
 */
export function useAccounts() {
  const [data, setData] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reload = useMemo(
    () =>
      singleFlight(async () => {
        try {
          const [{ accounts, projects: assigned }, projects] = await Promise.all([wings.claudeAccounts(), wings.projects()]);
          setData({ accounts, assigned, projects });
          setError(null);
        } catch (e) {
          setError(errorMessage(e));
        }
      }),
    [],
  );
  useEffect(() => {
    // `onFocus` says the current state once, so a page that starts in front loads from there.
    if (!wings.focused) void reload();
    const stopFocus = wings.onFocus(({ focused }) => focused && void reload());
    const stopChanged = ch.on("accounts-changed", () => void reload());
    return () => {
      stopFocus();
      stopChanged();
    };
  }, [reload]);
  return { data, error, reload };
}

/** Reloads the list after a change and tells the other page to. */
export async function changed(reload: () => Promise<void>) {
  await reload();
  void ch.tell("accounts-changed");
}
