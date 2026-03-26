import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
  }>;
  onBack?: () => void;
  className?: string;
}

export const Breadcrumb = React.forwardRef<HTMLDivElement, BreadcrumbProps>(
  ({ items, onBack, className }, ref) => {
    return (
      <div ref={ref} className={cn('flex items-center gap-3', className)}>
        {onBack && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onBack}
            className="p-0 h-auto"
          >
            <ChevronLeft size={20} />
          </Button>
        )}
        <div className="flex items-center gap-2 text-sm">
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <span className="text-gray-400 dark:text-gray-500">/</span>
              )}
              {item.href ? (
                <a
                  href={item.href}
                  className="text-primary hover:underline font-medium"
                >
                  {item.label}
                </a>
              ) : (
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {item.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';
