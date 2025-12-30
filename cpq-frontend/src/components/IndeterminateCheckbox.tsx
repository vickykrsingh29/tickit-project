import React, { useRef, useEffect } from 'react';

interface IndeterminateCheckboxProps {
  indeterminate?: boolean;
  [key: string]: any;
}

export const IndeterminateCheckbox: React.FC<IndeterminateCheckboxProps> = ({
  indeterminate = false,
  ...rest
}) => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
      {...rest}
    />
  );
}; 