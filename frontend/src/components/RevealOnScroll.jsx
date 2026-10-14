import { useEffect, useRef, useState } from "react";
export const RevealOnScroll = ({
  children,
  delay = 0,
  className = "",
  style = {},
  topThreshold = 80,
  bottomThreshold = 30
}) => {
  const domRef = useRef(null);
  const [state, setState] = useState("below");
  useEffect(() => {
    const el = domRef.current;
    if (!el) return;
    let rafId = null;
    const updatePosition = () => {
      if (!domRef.current) return;
      const rect = domRef.current.getBoundingClientRect();
      const vHeight = window.innerHeight || document.documentElement.clientHeight;
      if (rect.bottom < topThreshold) {
        setState((prev) => prev !== "above" ? "above" : prev);
      } else if (rect.top > vHeight - bottomThreshold) {
        setState((prev) => prev !== "below" ? "below" : prev);
      } else {
        setState((prev) => prev !== "visible" ? "visible" : prev);
      }
    };
    const onScrollOrResize = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        updatePosition();
        rafId = null;
      });
    };
    updatePosition();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [topThreshold, bottomThreshold]);
  return <div
    ref={domRef}
    className={`scroll-reveal-box is-${state} ${className}`}
    style={{
      ...style,
      transitionDelay: state === "visible" ? `${delay}ms` : "0ms"
    }}
  >{children}</div>;
};
