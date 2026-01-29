import React from 'react';
import { Button } from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';

interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'gradient';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  isLoading = false,
  loadingText = 'Loading...',
  children,
  className = '',
  disabled,
  variant = 'primary',
  ...props
}) => {
  const baseClasses =
    'h-12 px-8 text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0';

  const variantClasses =
    variant === 'gradient'
      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
      : 'bg-indigo-600 hover:bg-indigo-700 text-white';

  return (
    <Button
      className={`${baseClasses} ${variantClasses} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className='w-4 h-4 mr-2 animate-spin' />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default PrimaryButton;
