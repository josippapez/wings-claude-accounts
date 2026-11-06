import { useId, useState } from "react";

import { Button, Notice, Row, Stack, Text, useAction } from "wings-plugin-ui";

import { accountOf, startLabel, type Loaded } from "../lib/accounts";

/**
 * One compact button for each account the project doesn't use, starting Claude in a new terminal there as that account.
 * The project keeps its own account; its terminals and "Open Claude" are for that one.
 */
export function StartClaude({ project, data }: { project: { id: string; path: string }; data: Loaded }) {
  const start = useAction();
  const label = useId();
  const [starting, setStarting] = useState<string | null>(null);
  const now = accountOf(data, project.id);
  const others = data.accounts.filter((a) => a.name !== now);
  if (!others.length) return null;

  return (
    <Stack gap="s">
      <Text tone="muted" size="small" id={label}>
        Start Claude as
      </Text>
      <Row wrap gap="s" role="group" aria-labelledby={label}>
        {others.map((account) => {
          const name = startLabel(account);
          const key = account.name ?? "";
          return (
            <Button
              key={key}
              variant="outline"
              size="xs"
              busy={start.busy && starting === key}
              aria-label={`Start Claude as ${name}`}
              title={`Start Claude as ${name} in a new terminal. ${now === null ? "The project keeps the default account." : "The project keeps its own account."}`}
              onClick={() => {
                setStarting(key);
                void start.run(() => wings.openPane({ command: "claude", cwd: project.path, claudeAccount: account.name }));
              }}
            >
              {name}
            </Button>
          );
        })}
      </Row>
      {start.error ? <Notice tone="danger">{start.error}</Notice> : null}
    </Stack>
  );
}
