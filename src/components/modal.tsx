"use client";

import { useRef, type ReactNode } from "react";
import { X } from "lucide-react";

// Wraps the native <dialog> element rather than hand-rolling focus-trapping
// and ESC-to-close — the browser already does both correctly for free.
// children is a render-prop so modal content can call close() itself (e.g.
// after a client-side action succeeds) without lifting state up.
export function Modal({
  trigger,
  triggerClassName,
  title,
  children,
}: {
  trigger: ReactNode;
  triggerClassName?: string;
  title: string;
  children: ReactNode;
}) {

  const dialogRef = useRef<HTMLDialogElement>(null);

  function open() {
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button type="button" onClick={open} className={triggerClassName}>
        {trigger}
      </button>

      {/* The dialog itself is a full-viewport, transparent, flex-centered
          overlay. Clicking it (the backdrop area) closes the modal; the
          inner card stops that click from bubbling so clicks inside the
          modal's actual content never close it. */}
      <dialog
        ref={dialogRef}
        onClick={close}
        className="m-0 h-screen max-h-none w-screen max-w-none bg-transparent p-4 backdrop:bg-black/40 open:flex open:items-center open:justify-center"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-xl border border-border bg-white"
        >
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="font-heading text-lg font-semibold text-foreground">{title}</h2>
            <button type="button" onClick={close} aria-label="Close" className="text-muted hover:text-foreground">
              <X size={20} />
            </button>
          </div>
            <div className="max-h-[70vh] overflow-y-auto p-4">{children}</div>
        </div>
      </dialog>
    </>
  );
}
