import type { ReactNode } from "react";

import { Button, Notice, Row, Stack, Text, useAction } from "wings-plugin-ui";

import { signIn, type Account } from "../lib/accounts";

/**
 * A warning that `account` has no sign-in, in `children`, with a button that opens a terminal as the account to sign in.
 * `cwd` is the project to open it in, if there is one.
 */
export function NotSignedIn({ account, cwd, reload, children }: { account: Account; cwd: string | undefined; reload: () => Promise<void>; children: ReactNode }) {
  const open = useAction();
  return (
    <Stack gap="xs">
      <Row>
        <Text tone="warn" size="small" grow title={account.dir}>
          {children}
        </Text>
        <Button
          variant="outline"
          size="xs"
          busy={open.busy}
          disabled={cwd === undefined}
          title={cwd === undefined ? "Open a project first" : "Opens a terminal as this account running claude auth login"}
          onClick={() => cwd !== undefined && void open.run(() => signIn(account, cwd, reload))}
        >
          Sign in
        </Button>
      </Row>
      {open.error ? <Notice tone="danger">{open.error}</Notice> : null}
    </Stack>
  );
}
