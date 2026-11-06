import { useState, type Dispatch, type SetStateAction } from "react";

import { Button, Card, Field, Notice, Row, Select, Stack, Text, Title, useAction } from "wings-plugin-ui";

import { accountLabel, accountOf, changed, type Loaded } from "../lib/accounts";
import { StartClaude } from "./StartClaude";

/** What the card says after the project's account changed. */
export type Note = { kind: "switched" | "added"; label: string };

/** The select can't hold `null`, so the default account is this. It isn't a valid account name. */
const DEFAULT = "~default";
const valueOf = (name: string | null) => name ?? DEFAULT;

interface Props {
  project: { id: string; name: string; path: string };
  data: Loaded;
  reload: () => Promise<void>;
  note: Note | null;
  setNote: Dispatch<SetStateAction<Note | null>>;
  /** For the popover: no path under the project's name. */
  compact?: boolean;
}

/** The project on screen and the account its new terminals use, with a picker, and a way into Claude once it changed. */
export function ProjectAccount({ project, data, reload, note, setNote, compact }: Props) {
  const swap = useAction();
  const open = useAction();
  // The picker shows the account just picked while Wings saves it.
  const [picked, setPicked] = useState<string | null | undefined>();
  const shown = picked === undefined ? accountOf(data, project.id) : picked;
  const error = swap.error ?? open.error;

  const pick = async (value: string) => {
    const account = data.accounts.find((a) => valueOf(a.name) === value);
    if (!account || account.name === shown) return;
    setPicked(account.name);
    const worked = await swap.run(async () => {
      await wings.setClaudeAccount(project.id, account.name);
      await changed(reload);
    });
    setPicked(undefined);
    setNote(worked ? { kind: "switched", label: accountLabel(account) } : null);
  };

  return (
    <Card>
      <Stack gap="xs">
        <Title as="h2" size="large" truncate>
          {project.name}
        </Title>
        {compact ? null : (
          <Text tone="muted" size="small" mono truncate title={project.path}>
            {project.path}
          </Text>
        )}
      </Stack>
      <Field label="Claude account" hint={note ? undefined : "New terminals in this project use it."}>
        <Select
          options={data.accounts.map((a) => ({ value: valueOf(a.name), label: accountLabel(a) }))}
          value={valueOf(shown)}
          onChange={(value) => void pick(value)}
          disabled={swap.busy}
        />
      </Field>
      <StartClaude project={project} data={data} />
      {error ? <Notice tone="danger">{error}</Notice> : null}
      {note ? (
        <>
          <Notice tone="success">
            {note.kind === "added"
              ? `Added ${note.label} for ${project.name}. Claude asks you to sign in the first time it runs with it.`
              : `${project.name} uses ${note.label} now. New terminals start with it. Claude sessions that are open keep their account.`}
          </Notice>
          <Row>
            <Button variant="secondary" size="sm" busy={open.busy} onClick={() => void open.run(() => wings.openPane({ command: "claude", cwd: project.path }))}>
              Open Claude
            </Button>
            <Text tone="muted" size="small">
              in a new terminal
            </Text>
          </Row>
        </>
      ) : null}
    </Card>
  );
}
