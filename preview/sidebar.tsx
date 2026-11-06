import Sidebar, { page } from "../src/pages/sidebar";
import { accounts, projects, withAccounts, type Setup } from "./_accounts";

export { page };
export default withAccounts(Sidebar);

// The project on screen is "web", which uses the work account; the others use the default.
export const project = projects[0];
export { projects };

const assigned = { p1: "work", p3: "work" };
const setup = (more: Partial<Setup> = {}): { setup: Setup } => ({ setup: { accounts: accounts.default(), assigned, ...more } });

export const states = {
  // A project on the work account.
  work: { props: setup() },
  // A project on the default account, and an account that was never signed in.
  signedOut: { project: projects[1], props: setup({ accounts: accounts.signedOut() }) },
  // After picking the other account in the picker.
  switched: {
    props: setup({
      async steps(ui) {
        ui.press(await ui.find(() => document.querySelector('[role="combobox"]')));
        ui.press(await ui.find(() => ui.option("ada@example.com")));
      },
    }),
  },
  // The form with a name that isn't allowed.
  invalidName: {
    props: setup({
      async steps(ui) {
        (await ui.find(() => ui.button("Add account"))).click();
        ui.type(await ui.find(() => document.querySelector<HTMLInputElement>("form input")), "Client A");
      },
    }),
  },
  // After adding an account: the project now uses it and Claude opened in a terminal.
  added: {
    props: setup({
      async steps(ui) {
        (await ui.find(() => ui.button("Add account"))).click();
        ui.type(await ui.find(() => document.querySelector<HTMLInputElement>("form input")), "client-a");
        await ui.wait(50);
        (await ui.find(() => ui.button("Add and sign in"))).click();
      },
    }),
  },
  // A third account, its own setup on one and the default's on another; the project is on the default account.
  threeAccounts: { project: projects[1], props: setup({ accounts: accounts.ownSetup() }) },
  // After turning "Use my default setup" off for the work account.
  sharingOff: {
    props: setup({
      async steps(ui) {
        const box = await ui.find(() => document.querySelector<HTMLButtonElement>('[role="checkbox"]'));
        box.click();
        await ui.wait(400);
      },
    }),
  },
  // Starting Claude as another account failed.
  startFailed: {
    props: setup({
      openFailure: "Claude Code isn't installed, or `claude` isn't on your PATH.",
      async steps(ui) {
        (await ui.find(() => document.querySelector<HTMLButtonElement>('button[aria-label^="Start Claude as"]'))).click();
      },
    }),
  },
  // No project open.
  noProject: { project: null, props: setup() },
  // Wings can't answer.
  error: { props: setup({ failure: "Wings couldn't read the Claude accounts." }) },
};

