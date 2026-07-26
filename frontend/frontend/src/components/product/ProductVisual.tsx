import { useEffect, useState } from 'react'

type ProductVisualProps = {
  imageUrl?: string | null
  palette?: string
  label: string
  caption?: string
}

export function ProductVisual({ imageUrl, palette = 'sunset', label, caption }: ProductVisualProps) {
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
    <div
      className={`store-product-art store-product-art-${palette}`}
      role="img"
      aria-label={[label, caption].filter(Boolean).join(', ')}
    >
      <span className="store-product-art-shape" aria-hidden="true" />
      <span className="store-product-art-label" aria-hidden="true">
        <strong>{label}</strong>
        {caption && <small>{caption}</small>}
      </span>
    </div>
  )
}
