import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("btn", {
  variants: {
    variant: {
      default: "",
      secondary: "btn--secondary",
      outline: "btn--outline",
      ghost: "btn--ghost",
      destructive: "btn--danger",
      success: "btn--success",
      link: "btn--link",
    },
    size: {
      default: "",
      sm: "btn--sm",
      lg: "btn--lg",
      icon: "btn--icon",
      "icon-sm": "btn--icon-sm",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string }>;
      return React.cloneElement(child, {
        ...props,
        className: cn(buttonVariants({ variant, size }), className, child.props?.className),
      });
    }
    return (
      <button className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
