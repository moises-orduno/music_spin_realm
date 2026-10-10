import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getImageUrl = (url, defaultImage) => {
  if (!url) {
    return `/images/${defaultImage}`;
  }

  try {
    new URL(url);
    return url;
  } catch {
    return `/images/${defaultImage}`;
  }
};