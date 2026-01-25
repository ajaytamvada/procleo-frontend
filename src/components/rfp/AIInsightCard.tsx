import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AIInsightCardProps {
  title: string;
  recommendation: string;
  explanation: string;
  icon: LucideIcon;
  variant: 'cost' | 'delivery' | 'compliance';
  metrics?: { label: string; value: string }[];
}

const variantStyles = {
  cost: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-900',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
  },
  delivery: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-700',
  },
  compliance: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-900',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
  },
};

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  title,
  recommendation,
  explanation,
  icon: Icon,
  variant,
  metrics,
}) => {
  const styles = variantStyles[variant];

  return (
    <div
      className={`rounded-lg border ${styles.border} ${styles.bg} p-4 transition-all hover:shadow-md`}
    >
      <div className='flex items-start gap-4'>
        <div
          className={`w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center flex-shrink-0`}
        >
          <Icon className={`w-5 h-5 ${styles.iconColor}`} />
        </div>
        <div className='flex-1'>
          <div className='flex items-center gap-2 mb-1'>
            {/* Sparkle/AI icon effect */}
            <h3
              className={`font-semibold ${styles.text} flex items-center gap-1.5`}
            >
              {title}
            </h3>
            <span className='px-2 py-0.5 text-xs font-medium bg-white/60 rounded-full border border-black/5'>
              AI Insight
            </span>
          </div>

          <div className='mb-3'>
            <p className='font-bold text-gray-900'>{recommendation}</p>
            <p className='text-sm text-gray-600 mt-1 leading-relaxed'>
              {explanation}
            </p>
          </div>

          {metrics && metrics.length > 0 && (
            <div className='grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-black/5'>
              {metrics.map((metric, idx) => (
                <div key={idx}>
                  <p className='text-xs text-gray-500 uppercase font-medium'>
                    {metric.label}
                  </p>
                  <p className='text-sm font-semibold text-gray-900'>
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
