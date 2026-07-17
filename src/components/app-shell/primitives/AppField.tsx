"use client";

import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

type AppFieldLabelProps = {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
};

export function AppFieldLabel({ children, htmlFor, className = "" }: AppFieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className={"app-field-label " + className}>
      {children}
    </label>
  );
}

type AppFieldInputProps = {
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className">;

export function AppFieldInput({ className = "", ...rest }: AppFieldInputProps) {
  return <input className={"app-field-input " + className} {...rest} />;
}

type AppFieldTextareaProps = {
  className?: string;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className">;

export function AppFieldTextarea({ className = "", ...rest }: AppFieldTextareaProps) {
  return <textarea className={"app-field-input app-field-textarea " + className} {...rest} />;
}
