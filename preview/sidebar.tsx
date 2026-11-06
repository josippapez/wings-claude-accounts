import Sidebar, { page } from "../src/pages/sidebar";
import { accounts, projects, withAccounts, type Setup } from "./_accounts";

export { page };
export default withAccounts(Sidebar);

// The project on screen is "web", which uses the work account; the others use the default.
export const project = projects[0];
export { projects };

const assigned = { p1: "work", p3: "work" };
const setup = (more: Partial<Setup> = {}): { setup: Setup } => ({ setup: { accounts: [...accounts.default], assigned, ...more } });

export const states = {
  // A project on the work account.
  work: { props: setup() },
  // A project on the default account, and an account that was never signed in.
  signedOut: { project: projects[1], props: setup({ accounts: [...accounts.signedOut] }) },
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
  // No project open.
  noProject: { project: null, props: setup() },
  // Wings can't answer.
  error: { props: setup({ failure: "Wings couldn't read the Claude accounts." }) },
};

