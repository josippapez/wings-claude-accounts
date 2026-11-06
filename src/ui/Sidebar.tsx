import { useState } from "react";

import { Button, Empty, Heading, Loading, Notice, Text, useProject } from "wings-plugin-ui";

import { useAccounts } from "../lib/accounts";
import { AccountList } from "./AccountList";
import { AddAccount } from "./AddAccount";
import { ProjectAccount, type Note } from "./ProjectAccount";

/** The project on screen and its account, then every account and who uses it, and a form to add one. */
export function Sidebar() {
  const project = useProject();
  const { data, error, reload } = useAccounts();
  const [note, setNote] = useState<Note | null>(null);
  const [adding, setAdding] = useState(false);

  if (project === undefined || (!data && !error)) return <Loading />;
  if (!data)
    return (
      <Empty title="Couldn't read the Claude accounts" description={error}>
        <Button variant="secondary" onClick={() => void reload()}>
          Try again
        </Button>
      </Empty>
    );
  return (
    <>
      {error ? <Notice tone="danger">{error}</Notice> : null}
      <Heading>Project</Heading>
      {project ? (
        // Keyed so another project starts without the last one's message.
        <ProjectAccount key={project.id} project={project} data={data} reload={reload} note={note} setNote={setNote} />
      ) : (
        <Text as="p" tone="muted">
          Open a project to choose its Claude account.
        </Text>
      )}
      <Heading
        actions={
          <Button variant="ghost" size="sm" aria-expanded={adding} disabled={!project} title={project ? undefined : "Open a project first"} onClick={() => setAdding(!adding)}>
            Add account
          </Button>
        }
      >
        Accounts
      </Heading>
      {project && adding ? <AddAccount project={project} data={data} reload={reload} setNote={setNote} onDone={() => setAdding(false)} /> : null}
      <AccountList data={data} current={project?.id ?? null} />
    </>
  );
}
