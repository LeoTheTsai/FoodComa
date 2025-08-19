import React, { useEffect, useRef, useState } from "react";

export type Option = { value: string; label: string };

type Props = {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
};

export default function Dropdown({ value, onChange, options, placeholder = "Select...", className = "", buttonClassName = "" }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const current = options.find(o => o.value === value);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, []);

  return (
    <div ref={wrapRef} className={["relative", className].join(" ")}> 
      <button
        type="button"
        className={[
          "w-full rounded-xl border border-emerald-200 bg-white/90 px-3 py-2",
          "text-left flex items-center justify-between",
          "focus:outline-none focus:ring-2 focus:ring-emerald-300",
          buttonClassName,
        ].join(" ")}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={current ? "text-gray-800" : "text-gray-500"}>{current ? current.label : placeholder}</span>
        <span className="ml-2 text-emerald-700">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className={`w-5 h-5 transition-transform ${open ? "rotate-180" : ""}`}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto border border-emerald-100 rounded-xl bg-white shadow-md thin-scroll">
          {options.map((o) => {
            const selected = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                className={`w-full flex items-center justify-between px-3 py-2 border-b last:border-0 text-left hover:bg-emerald-50/40 ${selected ? "bg-emerald-50" : ""}`}
                onClick={() => { onChange(o.value); setOpen(false); }}
                role="option"
                aria-selected={selected}
              >
                <span className="text-gray-800">{o.label}</span>
                {selected ? (
                  <span className="text-emerald-700">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                ) : null}
              </button>
            );
          })}
          {!options.length && (
            <div className="px-3 py-2 text-sm text-gray-500">No options</div>
          )}
        </div>
      )}
    </div>
  );
}
