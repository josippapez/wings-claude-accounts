import { Badge, List, ListItem, Row, Stack, Text } from "wings-plugin-ui";

import { accountOf, projectsUsing, type Loaded } from "../lib/accounts";

/** Each account with who it is and the projects that use it. `current` is the project on screen, if any. */
export function AccountList({ data, current }: { data: Loaded; current: string | null }) {
  const now = current === null ? undefined : accountOf(data, current);
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
              {account.email ? (
                <Text tone="muted" size="small" truncate title={account.dir}>
                  {account.email}
                </Text>
              ) : (
                <Text tone="warn" size="small" title={account.dir}>
                  Not signed in
                </Text>
              )}
              <Text tone="muted" size="small" clamp title={users.join(", ")}>
                {users.length ? `Used by ${users.join(", ")}` : "No projects use it"}
              </Text>
            </Stack>
          </ListItem>
        );
      })}
    </List>
  );
}
