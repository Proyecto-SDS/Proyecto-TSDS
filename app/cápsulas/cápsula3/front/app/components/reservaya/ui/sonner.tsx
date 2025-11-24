// components/ui/sonner.tsx
"use client";

import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

type Props = ToasterProps;

export function Toaster(props: Props) {
  return (
    <SonnerToaster
      theme="light"
      position={props.position ?? "top-center"}
      richColors={props.richColors ?? true}
      {...props}
    />
  );
}
