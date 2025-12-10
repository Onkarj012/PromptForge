import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "glass" | "secondary" | "ghost" | "danger" | "outline";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = "glass",
            size = "md",
            isLoading = false,
            leftIcon,
            rightIcon,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const baseStyles =
            "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] border shadow-sm backdrop-blur-md";

        const variants = {
            glass:
                "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]",
            secondary:
                "bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white",
            outline:
                "bg-transparent border-white/10 text-zinc-400 hover:border-white/20 hover:text-white",
            ghost:
                "bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-white/5",
            danger:
                "bg-red-500/5 border-red-500/20 text-red-500 hover:bg-red-500/10",
        };

        const sizes = {
            sm: "h-9 px-3 text-sm",
            md: "h-11 px-5 text-base",
            lg: "h-14 px-8 text-lg",
        };

        return (
            <button
                ref={ref}
                // @ts-ignore - variant string mismatch with interface but handled in JS
                className={cn(baseStyles, variants[variant] || variants.glass, sizes[size], className)}
                disabled={isLoading || disabled}
                {...props}
            >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
                {children}
                {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
            </button>
        );
    }
);

Button.displayName = "Button";
