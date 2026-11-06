import { useState } from "react";

import { Button, Empty, Loading, Notice, Row, Text, Title, useProject } from "wings-plugin-ui";

import { useAccounts } from "../lib/accounts";
import { ProjectAccount, type Note } from "./ProjectAccount";

/** The popover under the title bar button: the project on screen and its account, to switch at a glance. */
export function Popover() {
  const project = useProject();
  const { data, error, reload } = useAccounts();
  const [note, setNote] = useState<Note | null>(null);

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
      <Row>
        <Title as="h1" truncate>
          Claude accounts
        </Title>
        <Text grow />
        <Button variant="ghost" size="sm" onClick={() => void wings.openView("accounts")}>
          All accounts
        </Button>
      </Row>
      {error ? <Notice tone="danger">{error}</Notice> : null}
      {project ? (
        <ProjectAccount key={project.id} project={project} data={data} reload={reload} note={note} setNote={setNote} compact />
      ) : (
        <Text as="p" tone="muted">
          Open a project to choose its Claude account.
        </Text>
      )}
    </>
  );
}
