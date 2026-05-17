"use client";

import { useEffect, useRef } from "react";

import { ComingSoonContent } from "@/_components/product/coming-soon-content";
import { COMING_SOON_COPY, type ComingSoonProduct } from "@/_lib/product/coming-soon";
import { cn } from "@/_lib/utils";

export function ComingSoonModule({
  product,
  onClose,
}: {
  product: ComingSoonProduct | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (product) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [product]);

  if (!product) return null;

  const copy = COMING_SOON_COPY[product];

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "fixed inset-0 z-[100] m-0 max-h-none max-w-none border-0 bg-transparent p-4 backdrop:bg-black/70 backdrop:backdrop-blur-sm",
        "open:flex open:items-center open:justify-center",
      )}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div
        role="document"
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b0e14]/95 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <ComingSoonContent copy={copy} onClose={onClose} compact />
      </div>
    </dialog>
  );
}
