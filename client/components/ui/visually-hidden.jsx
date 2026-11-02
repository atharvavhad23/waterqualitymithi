import * as React from "react";

const VisuallyHidden = React.forwardRef(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
    style={{
      clip: "rect(0, 0, 0, 0)",
      clipPath: "inset(50%)",
    }}
    {...props}
  />
));

VisuallyHidden.displayName = "VisuallyHidden";

export { VisuallyHidden };
