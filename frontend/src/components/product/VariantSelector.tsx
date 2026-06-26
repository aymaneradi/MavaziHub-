import type { ProductVariant } from '../../types/Product'

type VariantSelectorProps = {
  variants: ProductVariant[]
  selectedVariantId: number | null
  onVariantChange: (variantId: number) => void
}

function getVariantLabel(variant: ProductVariant): string {
  if (variant.variantLabel) {
    return variant.variantLabel
  }

  const parts = [variant.size, variant.color, variant.pattern].filter(Boolean)

  if (parts.length === 0) {
    return `Variante ${variant.id}`
  }

  return parts.join(' / ')
}

function VariantSelector({
  variants,
  selectedVariantId,
  onVariantChange,
}: VariantSelectorProps) {
  const activeVariants = variants.filter((variant) => variant.active !== false)

  if (activeVariants.length === 0) {
    return (
      <p className="mh-text-muted">
        Für dieses Produkt sind aktuell keine Varianten verfügbar.
      </p>
    )
  }

  return (
    <div className="mh-variant-selector">
      {activeVariants.map((variant) => {
        const isSelected = variant.id === selectedVariantId
        const isOutOfStock = variant.stockQuantity <= 0

        return (
          <button
            key={variant.id}
            type="button"
            className={
              isSelected
                ? 'mh-variant-option mh-variant-option-selected'
                : 'mh-variant-option'
            }
            onClick={() => onVariantChange(variant.id)}
            disabled={isOutOfStock}
          >
            <span>{getVariantLabel(variant)}</span>
            <small>
              {isOutOfStock
                ? 'Nicht verfügbar'
                : `${variant.stockQuantity} verfügbar`}
            </small>
          </button>
        )
      })}
    </div>
  )
}

export default VariantSelector