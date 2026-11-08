// The project on screen, followed as it changes.

import { useEffect, useState } from "react";

type Project = Awaited<ReturnType<Wings["project"]>>;

/**
 * The project the page is about: `undefined` until Wings says, then the project, or `null` when none is open. Follows
 * `wings.onProject`, so the sidebar and popover move with the project on screen. `wings-plugin-ui`'s native `useProject`
 * reads it once, and a native Wings without `onProject` never says it changed, so there it is read again whenever
 * Wings comes to the front or the panes change (switching projects changes the focused pane).
 */
export function useProject(): Project | undefined {
  const [project, setProject] = useState<Project | undefined>(undefined);
  useEffect(() => {
    if (typeof wings.onProject === "function") return wings.onProject(setProject);
    let live = true;
    const read = () =>
      void wings.project().then(
        (next) => live && setProject((now) => (now?.id === next?.id && now?.name === next?.name ? now : next)),
        () => live && setProject(null),
      );
    read();
    const stopFocus = wings.onFocus(({ focused }) => focused && read());
    const stopPanes = wings.onPanes(read);
    return () => {
      live = false;
      stopFocus();
      stopPanes();
    };
  }, []);
  return project;
}
