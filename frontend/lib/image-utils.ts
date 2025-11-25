export function getImageUrl(imageRef: string | null): string | null {
  if (!imageRef) return null

  // Check if it's a localStorage reference
  if (imageRef.startsWith("avatar-") || imageRef.startsWith("post-image-") || imageRef.startsWith("gallery-")) {
    try {
      const data = localStorage.getItem(imageRef)
      return data || null
    } catch (e) {
      console.error("[v0] Error retrieving image from localStorage:", e)
      return null
    }
  }

  // Otherwise return the URL as-is (for external URLs)
  return imageRef
}
