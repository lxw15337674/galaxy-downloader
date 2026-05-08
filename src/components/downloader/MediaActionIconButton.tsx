import type { ComponentType, SVGProps } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MediaActionIconButtonProps {
    label: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    variant?: 'outline' | 'secondary' | 'default';
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    onClick: () => void;
}

export function MediaActionIconButton({
    label,
    icon: Icon,
    variant = 'outline',
    disabled,
    loading,
    className,
    onClick,
}: MediaActionIconButtonProps) {
    return (
        <Button
            type="button"
            variant={variant}
            size="icon"
            className={cn("h-8 w-8 shrink-0", className)}
            disabled={disabled}
            onClick={onClick}
            aria-label={label}
            title={label}
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Icon className="h-4 w-4" />
            )}
        </Button>
    );
}
