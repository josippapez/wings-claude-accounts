// Shared by the fixtures: a fake Wings answering the Claude accounts calls from made-up data, and a way to click through a page.

import { useState, type ReactElement } from "react";

export const projects = [
  { id: "p1", name: "web", path: "/work/acme/web", branch: "main" },
  { id: "p2", name: "api", path: "/work/acme/api", branch: "main" },
  { id: "p3", name: "dashboard", path: "/work/acme/dashboard", branch: "feature/billing" },
  { id: "p4", name: "notes", path: "/home/ada/notes", branch: "main" },
];

type Account = { name: string | null; dir: string; email: string | null; signedIn: boolean };

const personal: Account = { name: null, dir: "/Users/ada/.claude", email: "ada@example.com", signedIn: true };
const work: Account = { name: "work", dir: "/Users/ada/.claude-work", email: "ada@acme.example", signedIn: true };
const fresh: Account = { name: "client-a", dir: "/Users/ada/.claude-client-a", email: null, signedIn: false };

export const accounts = { default: [personal, work], signedOut: [personal, work, fresh] };

export interface Setup {
  accounts: Account[];
  assigned: Record<string, string>;
  /** Clicks through the page after it has loaded, to reach a state a shot can't ask for. */
  steps?: (ui: Drive) => Promise<void>;
  /** What `claudeAccounts` fails with, for the page's error state. */
  failure?: string;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** What a state's steps use to click through the page like a person. */
export const drive = {
  async find<T extends Element>(look: () => T | null | undefined): Promise<T> {
    for (let i = 0; i < 100; i++) {
      const el = look();
      if (el) return el;
      await wait(20);
    }
    throw new Error("The page never showed what the step looks for.");
  },
  button: (text: string) => [...document.querySelectorAll("button")].find((b) => b.textContent?.trim() === text),
  option: (text: string) => [...document.querySelectorAll('[role="option"]')].find((o) => o.textContent?.includes(text)),
  /** A press on an element, as far as Base UI's menus are concerned: they open on the pointer going down and pick on it going up. */
  press(el: Element) {
    for (const type of ["pointerdown", "mousedown", "pointerup", "mouseup", "click"]) el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, button: 0 }));
  },
  /** Types into a React input, which only listens to its own value setter's event. */
  type(input: HTMLInputElement, value: string) {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  },
  wait,
};
export type Drive = typeof drive;

/** Wraps a page so `wings.claudeAccounts` and `setClaudeAccount` answer from `setup`, and its steps run once the page has drawn. */
export function withAccounts(Page: () => ReactElement) {
  return function Preview({ setup }: { setup: Setup }) {
    // Before the page's first effect asks for them. The stub's `wings` takes new calls as plain properties.
    useState(() => {
      const w = window.wings as unknown as Record<string, unknown>;
      const assigned = { ...setup.assigned };
      w.claudeAccounts = async () => {
        if (setup.failure) throw new Error(setup.failure);
        return { accounts: setup.accounts, projects: { ...assigned } };
      };
      w.setClaudeAccount = async (id: string, name: string | null) => {
        if (name === null) delete assigned[id];
        else assigned[id] = name;
        if (name && !setup.accounts.some((a) => a.name === name)) setup.accounts.push({ name, dir: `/Users/ada/.claude-${name}`, email: null, signedIn: false });
      };
      w.openPane = async () => ({ paneId: "pane-new" });
      if (setup.steps) void wait(100).then(() => setup.steps?.(drive));
    });
    return <Page />;
  };
}
