import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change?: number;
  color?: string;
  className?: string;
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ icon, title, value, change, color = '#6C63FF', className }, ref) => {
    const isPositive = change !== undefined ? change >= 0 : true;

    return (
      <Card ref={ref} className={cn('', className)}>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: color + '20',
              }}
            >
              <div style={{ color }}>{icon}</div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {value}
                </p>
                {change !== undefined && (
                  <div
                    className={cn(
                      'flex items-center gap-1 text-xs font-semibold',
                      isPositive ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {isPositive ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    {Math.abs(change)}%
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

StatCard.displayName = 'StatCard';
