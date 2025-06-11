export const handleKeyDown = (e: KeyboardEvent): number | null => {
  if (e.key === "ArrowRight") {
    return 1;
  } else if (e.key === "ArrowLeft") {
    // Handle left arrow key press
    return 2;
  }
  return null;
};