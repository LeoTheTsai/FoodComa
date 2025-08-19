import React from "react";

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  wrapperClassName?: string;
};

export default function Select({ className = "", wrapperClassName = "", children, disabled, ...props }: Props) {
  return (
    <div className={`relative ${wrapperClassName}`}>
      <select
        {...props}
        disabled={disabled}
        className={[
          "w-full appearance-none rounded-xl border border-emerald-200 bg-white/90 px-3 py-2 pr-10",
          "focus:outline-none focus:ring-2 focus:ring-emerald-300",
          disabled ? "opacity-60 cursor-not-allowed" : "",
          className,
        ].join(" ")}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-emerald-700">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </span>
    </div>
  );
}
