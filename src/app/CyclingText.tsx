"use client";

import { useState, useEffect } from "react";

export function CyclingText() {
  const words = ["manage", "track", "grow", "understand", "run", "scale"];
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
        setFade(true);
      }, 300); // Duration of the fade out
    }, 2800); // Time between shifts

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-block min-w-[90px] text-left">
      <span
        className={`inline-block font-bold transition-all duration-300 transform ${
          fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
        style={{ color: "var(--accent)" }}
      >
        {words[index]}
      </span>
    </span>
  );
}
