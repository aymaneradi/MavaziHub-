type ProductVisualProps = {
  imageUrl?: string
  palette?: string
  label: string
}

export function ProductVisual({ imageUrl, palette = 'sunset', label }: ProductVisualProps) {
  if (imageUrl) {
    return <img className="store-product-photo" src={imageUrl} alt={label} />
  }

  return (
    <div className={`store-product-art store-product-art-${palette}`} aria-label={label}>
      <span />
    </div>
  )
}
