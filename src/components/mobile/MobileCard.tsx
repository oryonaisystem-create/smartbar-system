import React from 'react';
import { ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface MobileCardProps {
    title: string;
    subtitle?: string;
    value?: string | number;
    description?: string;
    icon?: React.ReactNode;
    badge?: {
        text: string;
        variant: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    };
    onClick?: () => void;
    children?: React.ReactNode;
    className?: string;
}

const MobileCard = ({
    title,
    subtitle,
    value,
    description,
    icon,
    badge,
    onClick,
    children,
    className
}: MobileCardProps) => {
    const badgeStyles = {
        primary: "bg-primary/20 text-primary border-primary/20",
        success: "bg-green-500/20 text-green-500 border-green-500/20",
        warning: "bg-yellow-500/20 text-yellow-500 border-yellow-500/20",
        danger: "bg-red-500/20 text-red-500 border-red-500/20",
        info: "bg-blue-500/20 text-blue-500 border-blue-500/20"
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "p-4 bg-white/[0.04] border border-white/10 rounded-2xl transition-all active:scale-[0.98] active:bg-white/[0.06] shadow-sm",
                onClick && "cursor-pointer",
                className
            )}
        >
            <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
                            {React.cloneElement(icon as React.ReactElement, { className: 'w-4.5 h-4.5' })}
                        </div>
                    )}
                    <div>
                        <h4 className="text-white font-bold uppercase text-[11px] tracking-widest">{title}</h4>
                        {subtitle && <p className="text-muted/80 text-[10px] font-medium mt-0.5">{subtitle}</p>}
                    </div>
                </div>
                {badge && (
                    <span className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        badgeStyles[badge.variant]
                    )}>
                        {badge.text}
                    </span>
                )}
            </div>

            {(value || description) && (
                <div className="mb-2">
                    {value && <div className="text-xl font-black text-white tracking-tighter italic leading-none mb-1">{value}</div>}
                    {description && <p className="text-muted/90 text-[11px] font-semibold leading-snug">{description}</p>}
                </div>
            )}

            {children && <div className="mt-3 pt-3 border-t border-white/5">{children}</div>}

            {onClick && !children && (
                <div className="flex justify-end mt-2">
                    <div className="p-2 rounded-xl bg-white/5">
                        <ChevronRight className="w-4 h-4 text-muted" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileCard;
