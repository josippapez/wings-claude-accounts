import { useId, useState } from "react";

import { Badge, Checkbox, List, ListItem, Notice, Row, Stack, Text, useAction } from "wings-plugin-ui";

import { accountOf, changed, projectsUsing, signInLabel, type Loaded } from "../lib/accounts";
import { NotSignedIn } from "./NotSignedIn";

/** Each account with who it is, or that it needs signing in, and the projects that use it. `project` is the one on screen, if any. */
export function AccountList({ data, project, reload }: { data: Loaded; project: { id: string; path: string } | null; reload: () => Promise<void> }) {
  const now = project === null ? undefined : accountOf(data, project.id);
  return (
    <List>
      {data.accounts.map((account) => {
        const users = projectsUsing(data, account);
        return (
          <ListItem key={account.name ?? ""} align="start">
            <Stack gap="xs" grow>
              <Row>
                <Text weight="medium" truncate>
                  {account.name ?? "Default"}
                </Text>
                {now !== undefined && now === account.name ? (
                  <Badge size="sm" tone="info">
                    This project
                  </Badge>
                ) : null}
              </Row>
              {account.signedIn ? (
                <Text tone="muted" size="small" truncate title={account.dir}>
                  {signInLabel(account)}
                </Text>
              ) : (
                <NotSignedIn account={account} cwd={project?.path} reload={reload}>
                  {signInLabel(account)}
                </NotSignedIn>
              )}
              <Text tone="muted" size="small" clamp title={users.join(", ")}>
                {users.length ? `Used by ${users.join(", ")}` : "No projects use it"}
              </Text>
              {account.name === null ? null : <ShareSetup name={account.name} on={account.sharesSetup} reload={reload} />}
            </Stack>
          </ListItem>
        );
      })}
    </List>
  );
}

/** Whether a named account uses the default account's settings, plugins, skills and rules. */
function ShareSetup({ name, on, reload }: { name: string; on: boolean; reload: () => Promise<void> }) {
  const share = useAction();
  const hint = useId();
  // The box shows the choice just made while Wings links the folders.
  const [picked, setPicked] = useState<boolean | undefined>();

  const toggle = async (next: boolean) => {
    setPicked(next);
    await share.run(async () => {
      await wings.shareClaudeSetup(name, next);
      await changed(reload);
    });
    setPicked(undefined);
  };

  return (
    <Stack gap="xs">
      <Checkbox checked={picked ?? on} onChange={(next) => void toggle(next)} disabled={share.busy} aria-describedby={hint}>
        Use my default setup
      </Checkbox>
      <Text tone="muted" size="small" id={hint}>
        Uses the default account's plugins, skills and rules, and a copy of its settings that keeps this account's own model. This account's own files are kept aside and come back when you turn it off.
      </Text>
      {share.error ? <Notice tone="danger">{share.error}</Notice> : null}
    </Stack>
  );
}
