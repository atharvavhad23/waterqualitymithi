import { describe, it, expect } from "vitest";
import { cn } from "./utils.js";

describe("cn utility", () => {
  it("should merge class names correctly", () => {
    expect(cn("px-2 py-1", "px-3")).toBe("py-1 px-3");
  });

  it("should handle conditional classes", () => {
    expect(cn("base", true && "conditional")).toBe("base conditional");
    expect(cn("base", false && "conditional")).toBe("base");
  });

  it("should handle arrays and objects", () => {
    expect(cn(["base", "extra"], { active: true, inactive: false })).toBe(
      "base extra active",
    );
  });
});
