import React from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    error?: string;
    containerClassName?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, label, error, containerClassName, ...props }, ref) => {
        return (
            <div className={`space-y-1 ${containerClassName || ''}`}>
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            ref={ref}
                            {...props}
                        />
                        <div className={`w-11 h-6 bg-gray-700/50 border border-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 ${className || ''}`}></div>
                    </div>
                    {label && (
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                            {label}
                        </span>
                    )}
                </label>
                {error && (
                    <p className="text-sm text-red-400 ml-1">{error}</p>
                )}
            </div>
        );
    }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
