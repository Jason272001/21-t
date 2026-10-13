"use client";
export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-lg bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950"
    >
      Print receipt
    </button>
  );
}
