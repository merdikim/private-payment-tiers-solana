import { QRCode } from "react-qr-code";

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCodeGenerator({ value, size = 128, className }: QRCodeGeneratorProps) {
  return (
    <div className={`inline-block ${className}`}>
      <QRCode
        value={value}
        size={size}
        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
        viewBox={`0 0 ${size} ${size}`}
      />
    </div>
  );
}