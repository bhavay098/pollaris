import { useEffect, useRef, useState, useCallback } from "react";

export default function DropdownMenu({
  trigger,
  children,
  align = "right",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState("bottom");
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  const calculatePlacement = useCallback(() => {
    if (!dropdownRef.current) return;
    const triggerRect = dropdownRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    const menuHeight = menuRef.current ? menuRef.current.offsetHeight : 260;

    // If not enough room below and more room above, flip upward
    if (spaceBelow < menuHeight + 16 && spaceAbove > spaceBelow) {
      setPlacement("top");
    } else {
      setPlacement("bottom");
    }
  }, []);

  const toggle = (e) => {
    e.stopPropagation();
    if (!isOpen) {
      calculatePlacement();
    }
    setIsOpen((prev) => !prev);
  };

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;

    calculatePlacement();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        close();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        close();
      }
    };

    const handleScrollOrResize = () => {
      calculatePlacement();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("scroll", handleScrollOrResize, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, true);
    };
  }, [isOpen, close, calculatePlacement]);

  const alignClass =
    align === "left" ? "left-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "right-0";

  const placementClass =
    placement === "top" ? "bottom-full mb-2" : "top-full mt-2";

  const originClass =
    align === "center"
      ? placement === "top"
        ? "origin-bottom"
        : "origin-top"
      : align === "left"
      ? placement === "top"
        ? "origin-bottom-left"
        : "origin-top-left"
      : placement === "top"
      ? "origin-bottom-right"
      : "origin-top-right";

  return (
    <div
      className={`relative inline-block text-left ${isOpen ? "z-50" : ""} ${className}`}
      ref={dropdownRef}
    >
      <div onClick={toggle} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && toggle(e)}>
        {trigger}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          className={`absolute ${alignClass} ${placementClass} ${originClass} z-50 min-w-[200px] max-h-[min(calc(100vh-32px),440px)] overflow-y-auto rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-solid)] p-1.5 shadow-[var(--app-shadow)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150`}
          role="menu"
          aria-orientation="vertical"
          onClick={(e) => {
            if (!e.target.closest("[data-keep-open]")) {
              close();
            }
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  as: Component = "button",
  children,
  onClick,
  variant = "default",
  className = "",
  disabled = false,
  ...props
}) {
  const variantClasses = {
    default:
      "text-[var(--app-text)] hover:bg-[color-mix(in_srgb,var(--app-primary)_12%,var(--app-surface-raised))] hover:text-[var(--app-primary)]",
    danger:
      "text-[var(--app-danger)] hover:bg-[color-mix(in_srgb,var(--app-danger)_12%,transparent)]",
    muted:
      "text-[var(--app-muted)] hover:bg-[var(--app-surface-raised)] hover:text-[var(--app-text)]",
  };

  const isButton = Component === "button";

  return (
    <Component
      {...(isButton ? { type: "button", disabled } : {})}
      role="menuitem"
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium no-underline transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        variantClasses[variant] || variantClasses.default
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export function DropdownDivider() {
  return <div className="my-1.5 h-px bg-[var(--app-border)]" role="separator" />;
}
