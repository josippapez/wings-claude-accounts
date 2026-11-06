// The popover under the title bar button: switch the account of the project on screen without opening the sidebar.

import { Popover } from "../ui/Popover";

export const page = { place: "popover" };

export default function PopoverPage() {
  return <Popover />;
}
