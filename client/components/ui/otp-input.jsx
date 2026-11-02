import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const OtpInput = React.forwardRef(
  (
    { length = 6, value = "", onChange, onComplete, className, ...props },
    ref,
  ) => {
    const [otp, setOtp] = useState(new Array(length).fill(""));
    const inputRefs = useRef([]);

    useEffect(() => {
      if (value) {
        const otpArray = value.split("").slice(0, length);
        while (otpArray.length < length) {
          otpArray.push("");
        }
        setOtp(otpArray);
      }
    }, [value, length]);

    useEffect(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, []);

    const handleChange = (element, index) => {
      if (isNaN(element.value)) return false;

      const newOtp = [...otp];
      newOtp[index] = element.value;
      setOtp(newOtp);

      if (onChange) {
        onChange(newOtp.join(""));
      }

      // Move to next input if current input is filled
      if (element.value && index < length - 1) {
        inputRefs.current[index + 1].focus();
      }

      // Call onComplete if all fields are filled
      if (newOtp.every((digit) => digit !== "") && onComplete) {
        onComplete(newOtp.join(""));
      }
    };

    const handleKeyDown = (e, index) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        inputRefs.current[index - 1].focus();
      }

      if (e.key === "ArrowLeft" && index > 0) {
        inputRefs.current[index - 1].focus();
      }

      if (e.key === "ArrowRight" && index < length - 1) {
        inputRefs.current[index + 1].focus();
      }
    };

    const handlePaste = (e) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData("text/plain");
      const pastedDigits = pastedData
        .replace(/\D/g, "")
        .split("")
        .slice(0, length);

      const newOtp = new Array(length).fill("");
      pastedDigits.forEach((digit, index) => {
        if (index < length) {
          newOtp[index] = digit;
        }
      });

      setOtp(newOtp);

      if (onChange) {
        onChange(newOtp.join(""));
      }

      // Focus on the next empty input or the last input
      const nextEmptyIndex = newOtp.findIndex((digit) => digit === "");
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1;
      if (inputRefs.current[focusIndex]) {
        inputRefs.current[focusIndex].focus();
      }

      if (newOtp.every((digit) => digit !== "") && onComplete) {
        onComplete(newOtp.join(""));
      }
    };

    return (
      <div className={cn("flex gap-2 justify-center", className)} {...props}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className={cn(
              "w-12 h-12 text-center text-lg font-semibold border border-input rounded-md bg-background",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              digit && "border-primary",
            )}
          />
        ))}
      </div>
    );
  },
);

OtpInput.displayName = "OtpInput";

export { OtpInput };
