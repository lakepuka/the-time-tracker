"use client";

import { useCallback, useRef, useState } from "react";
import { useOutsideClick } from "@/hooks/useOutsideClick";

/** Open/close state for a panel that closes when clicking outside its container. */
export function usePopover<T extends HTMLElement>() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<T>(null);

  const close = useCallback(() => setIsOpen(false), []);
  useOutsideClick(containerRef, close, isOpen);

  return { isOpen, setIsOpen, close, containerRef };
}
