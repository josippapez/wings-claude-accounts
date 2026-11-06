import Popover, { page } from "../src/pages/popover";
import { accounts, projects, withAccounts, type Setup } from "./_accounts";

export { page };
export default withAccounts(Popover);

export const project = projects[0];
export { projects };

const setup = (more: Partial<Setup> = {}): { setup: Setup } => ({ setup: { accounts: [...accounts.default], assigned: { p1: "work", p3: "work" }, ...more } });

export const states = {
  work: { props: setup() },
  // After picking the other account in the picker.
  switched: {
    props: setup({
      async steps(ui) {
        ui.press(await ui.find(() => document.querySelector('[role="combobox"]')));
        ui.press(await ui.find(() => ui.option("ada@example.com")));
      },
    }),
  },
  noProject: { project: null, props: setup() },
};
