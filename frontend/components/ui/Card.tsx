import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, hoverEffect = false, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "glass-panel rounded-2xl p-6 transition-all duration-500",
                    hoverEffect && "hover:border-white/10 hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.05)]",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = "Card";
