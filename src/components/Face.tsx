import { useState } from "react";
import { getInitials } from "../data/players";

/** Round player photo for the website UI; falls back to initials when the file is missing. */
export function Face({ name, image, size = "md" }: { name: string; image: string; size?: "sm" | "md" | "lg" }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={`face face--${size}`} aria-hidden="true">
      {failed ? <span className="face__initials">{getInitials(name)}</span> : <img src={image} alt="" draggable={false} loading="lazy" onError={() => setFailed(true)} />}
    </span>
  );
}
