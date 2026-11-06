// What the sidebar and the popover tell each other.

import { channel } from "wings-plugin-sdk/messages";

export const ch = channel<
  {},
  // A project's account changed, or an account was added: the other page loads the list again.
  { "accounts-changed": void }
>();
