import { useEffect, useState } from "react";
import "./AnnouncementBanner.css";

export default function AnnouncementBanner({
  message,
  type = "info",
  cta,
  dismissible = true,
  autoHideDuration = 0,
  position = "top",
  onClose,
}: {
  message: string;
  type?: "info" | "success" | "warning" | "danger";
  cta?: {
    text: string;
    href: string;
    onClick?: () => void;
  };
  dismissible?: boolean;
  autoHideDuration?: number | null;
  position?: "top" | "bottom";
  onClose?: () => void;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!autoHideDuration || !visible) return;
    const t = setTimeout(() => handleClose(), autoHideDuration);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoHideDuration, visible]);

  function handleClose() {
    setVisible(false);
    if (typeof onClose === "function") onClose();
  }

  if (!visible) return null;

  const role = type === "info" ? "status" : "alert";

  return (
    <div
      className={`announcement-banner announcement-${type} announcement-${position}`}
      role={role}
      aria-live="polite"
    >
      <div className="announcement-content">
        <div className="announcement-icon" aria-hidden>
          {/* simple inline icons using unicode to keep it pure CSS/HTML */}
          {type === "info" && "ℹ️"}
          {type === "success" && "✅"}
          {type === "warning" && "⚠️"}
          {type === "danger" && "🚫"}
        </div>

        <div className="announcement-message">{message}</div>

        {cta && (
          <a
            className="announcement-cta"
            href={cta.href}
            onClick={(e) => {
              if (cta.onClick) {
                e.preventDefault();
                cta.onClick();
              }
            }}
            rel="noopener noreferrer"
          >
            {cta.text}
          </a>
        )}

        {dismissible && (
          <button
            className="announcement-close"
            aria-label="Dismiss announcement"
            onClick={handleClose}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------------- AnnouncementBanner.css ---------------------- */
