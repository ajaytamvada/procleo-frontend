import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  number: number;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className='mb-10'>
      <div className='flex items-center justify-between relative'>
        {/* Progress Line Background */}
        <div className='absolute left-0 right-0 top-6 h-1 bg-gray-200 rounded-full -z-10' />
        <div
          className='absolute left-0 top-6 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full -z-10 transition-all duration-500'
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className='flex flex-col items-center relative bg-white px-2'>
              {/* Step Circle */}
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-base transition-all duration-300 shadow-lg
                  ${
                    currentStep > step.number
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white scale-100'
                      : currentStep === step.number
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white scale-110 ring-4 ring-indigo-100'
                        : 'bg-gray-100 text-gray-400 scale-95'
                  }`}
              >
                {currentStep > step.number ? (
                  <Check className='h-6 w-6' strokeWidth={3} />
                ) : (
                  step.number
                )}
              </div>

              {/* Step Label */}
              <span
                className={`mt-3 font-semibold text-sm transition-colors duration-300 whitespace-nowrap
                  ${
                    currentStep >= step.number
                      ? 'text-indigo-600'
                      : 'text-gray-400'
                  }
                `}
              >
                {step.label}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Stepper;
