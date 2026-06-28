import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="select-wrap">
        <select ref={ref} className={cn("select-native", className)} {...props}>
          {children}
        </select>
        <ChevronDown />
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
