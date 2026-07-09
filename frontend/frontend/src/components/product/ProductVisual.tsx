import { useEffect, useState } from 'react'

type ProductVisualProps = {
  imageUrl?: string | null
  palette?: string
  label: string
}

export function ProductVisual({ imageUrl, palette = 'sunset', label }: ProductVisualProps) {
  const [hasImageError, setHasImageError] = useState(false)

  useEffect(() => {
    setHasImageError(false)
  }, [imageUrl])

  if (imageUrl && !hasImageError) {
    return (
      <img
        className="store-product-photo"
        src={imageUrl}
        alt={label}
        onError={() => setHasImageError(true)}
      />
    )
  }

  return (
    <div className={`store-product-art store-product-art-${palette}`} aria-label={label}>
      <span />
    </div>
  )
}
