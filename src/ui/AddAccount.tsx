import { useState, type Dispatch, type SetStateAction } from "react";

import { Button, Card, Field, Row, Text, TextInput, useAction } from "wings-plugin-ui";

import { changed, nameProblem, type Loaded } from "../lib/accounts";
import type { Note } from "./ProjectAccount";

interface Props {
  project: { id: string; name: string; path: string };
  data: Loaded;
  reload: () => Promise<void>;
  setNote: Dispatch<SetStateAction<Note | null>>;
  /** Closes the form. */
  onDone: () => void;
}

/** Asks for a name, gives the project that account and opens Claude in a new terminal there to sign in. */
export function AddAccount({ project, data, reload, setNote, onDone }: Props) {
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const add = useAction();
  // Wrong characters show as they are typed; an empty name waits until Add is pressed.
  const problem = name ? nameProblem(name, data.accounts) : submitted ? "Enter a name for the account." : null;

  const submit = async () => {
    setSubmitted(true);
    if (!name || nameProblem(name, data.accounts)) return;
    await add.run(async () => {
      await wings.setClaudeAccount(project.id, name);
      await changed(reload);
      setNote({ kind: "added", label: name });
      onDone();
      await wings.openPane({ command: "claude", cwd: project.path });
    });
  };

  return (
    <Card
      as="form"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <Field label="Account name" hint="Lowercase letters, digits and dashes, like work or client-a." error={problem ?? add.error}>
        <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="work" autoFocus autoComplete="off" spellCheck={false} />
      </Field>
      <Text tone="muted" size="small">
        {`${project.name} switches to this account, and Claude opens in a new terminal there so you can sign in.`}
      </Text>
      <Row justify="end">
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" busy={add.busy}>
          Add and sign in
        </Button>
      </Row>
    </Card>
  );
}
