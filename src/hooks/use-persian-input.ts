import { useState, useCallback } from "react";

// Helper functions for Persian numbers
const toPersianNumbers = (str: string | number): string => {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const englishDigits = "0123456789";

  return str.toString().replace(/[0-9]/g, (digit) => {
    return persianDigits[englishDigits.indexOf(digit)];
  });
};

const toEnglishNumbers = (str: string): string => {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const englishDigits = "0123456789";

  return str.replace(/[۰-۹]/g, (digit) => {
    return englishDigits[persianDigits.indexOf(digit)];
  });
};

interface UsePersianInputOptions {
  maxLength?: number;
  onlyNumbers?: boolean;
}

export const usePersianInput = (
  initialValue: string = "",
  options: UsePersianInputOptions = {}
) => {
  const { maxLength, onlyNumbers = true } = options;
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback(
    (inputValue: string) => {
      let processedValue = inputValue;

      if (onlyNumbers) {
        // Remove non-numeric characters (except Persian and English digits)
        processedValue = processedValue.replace(/[^\d۰-۹]/g, "");
      }

      if (maxLength && processedValue.length > maxLength) {
        processedValue = processedValue.slice(0, maxLength);
      }

      // Convert Persian digits to English for internal storage
      const englishValue = toEnglishNumbers(processedValue);
      setValue(englishValue);
    },
    [maxLength, onlyNumbers]
  );

  const displayValue = toPersianNumbers(value);

  return {
    value, // English digits for API calls
    displayValue, // Persian digits for display
    handleChange,
    toPersianNumbers,
    toEnglishNumbers,
  };
};

export { toPersianNumbers, toEnglishNumbers };
