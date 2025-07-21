import { Check } from 'lucide-react';

interface Step {
  id: number;
  name: string;
  description: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function ProgressIndicator({ steps, currentStep }: ProgressIndicatorProps) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className={stepIdx !== steps.length - 1 ? 'flex-1' : ''}>
            <div className={`flex items-center ${stepIdx !== steps.length - 1 ? 'pr-8' : ''}`}>
              <div className="relative flex items-center justify-center">
                {step.id < currentStep ? (
                  <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                ) : step.id === currentStep ? (
                  <div className="h-10 w-10 border-2 border-indigo-600 bg-white rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold">{step.id}</span>
                  </div>
                ) : (
                  <div className="h-10 w-10 border-2 border-gray-300 bg-white rounded-full flex items-center justify-center">
                    <span className="text-gray-500">{step.id}</span>
                  </div>
                )}
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${
                  step.id <= currentStep ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.name}
                </p>
                <p className={`text-xs ${
                  step.id <= currentStep ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {step.description}
                </p>
              </div>
              {stepIdx !== steps.length - 1 && (
                <div className="ml-4 flex-1 h-0.5 bg-gray-200">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-500"
                    style={{ width: step.id < currentStep ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}