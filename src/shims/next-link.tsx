import React from "react";
import { Link as RouterLink, type LinkProps as RouterLinkProps } from "react-router-dom";

export type LinkProps = Omit<RouterLinkProps, "to"> & {
  href?: string;
  to?: string;
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
};

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, to, children, ...props }, ref) => {
    const destination = to || href || "#";

    // Handle external links or mailto
    if (
      destination.startsWith("http://") ||
      destination.startsWith("https://") ||
      destination.startsWith("mailto:")
    ) {
      return (
        <a href={destination} ref={ref} {...props}>
          {children}
        </a>
      );
    }

    return (
      <RouterLink ref={ref} to={destination} {...props}>
        {children}
      </RouterLink>
    );
  }
);

Link.displayName = "Link";
export default Link;
