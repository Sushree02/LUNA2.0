// Format duration in seconds to MM:SS
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Format library name
export const formatLibraryName = (name: string): string => {
  return name.trim() || "Untitled Library";
};