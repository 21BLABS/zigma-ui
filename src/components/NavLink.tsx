import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
  disabled?: boolean;
  children: ReactNode;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, disabled, children, ...props }, ref) => {
    if (disabled) {
      return (
        <span
          ref={ref}
          className={cn(
            className,
            "opacity-50 cursor-not-allowed text-gray-500"
          )}
          title="Agent features temporarily disabled"
        >
          {typeof children === 'function' ? null : children}
        </span>
      );
    }
    
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      >
        {children}
      </RouterNavLink>
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
