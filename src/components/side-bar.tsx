import { IconChess, IconSettings, type Icon } from "@tabler/icons-react";
import { Link, useMatchRoute } from "@tanstack/react-router";

import ActionTooltip from "@/components/ui/action-tooltip";
import { cn } from "@/lib/utils";

interface NavbarLinkProps {
  icon: Icon;
  label: string;
  url: string;
  active?: boolean;
}

function NavbarLink({ url, icon: Icon, label }: NavbarLinkProps) {
  const matcesRoute = useMatchRoute();
  return (
    <ActionTooltip label={label} side="right">
      <Link
        to={url}
        className={cn(
          "flex items-center justify-center size-12 border-main-container border-l-[3px] border-r-[3px]",
          matcesRoute({ to: url, fuzzy: true }) && "border-l-blue-500"
        )}
      >
        <Icon size="1.5rem" stroke={1.5} color="white" />
      </Link>
    </ActionTooltip>
  );
}

const linksdata = [{ icon: IconChess, label: "Board", url: "/" }];

const SideBar = () => {
  const links = linksdata.map((link) => (
    <NavbarLink {...link} label={link.label} key={link.label} />
  ));

  return (
    <div className="flex flex-col justify-between border-r border-main-border">
      <div>{links}</div>
      <div>
        <NavbarLink icon={IconSettings} label="settings" url="/settings" />
      </div>
    </div>
  );
};

export default SideBar;
