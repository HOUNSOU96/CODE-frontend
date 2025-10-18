// 📁 src/components/ui/button.tsx
import React, { ButtonHTMLAttributes } from "react";
import { motion,HTMLMotionProps } from "framer-motion";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
}

export const Button: React.FC<ButtonProps & HTMLMotionProps<"button">> = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  let baseClasses =
    "px-4 py-2 rounded-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  let variantClasses = "";

  switch (variant) {
    case "primary":
      variantClasses =
        "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500";
      break;
    case "secondary":
      variantClasses =
        "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400";
      break;
    case "danger":
      variantClasses =
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500";
      break;
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
