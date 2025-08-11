"use client";

import { ChromePicker, ColorResult } from "react-color";

export function ColorPicker({
  color,
  onChange,
}: {
  color: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="space-y-2">
      <ChromePicker
        color={color}
        onChange={(c: ColorResult) => onChange(c.hex)}
        styles={{
          default: {
            picker: {
              width: "100%",
              boxShadow: "none",
            },
          },
        }}
      />
    </div>
  );
}
