import type { Category } from '../../types/Product'

type CategoryFilterProps = {
  categories: Category[]
  selectedCategoryId: number | null
  onCategoryChange: (categoryId: number | null) => void
  disabled?: boolean
}

function CategoryFilter({
  categories,
  selectedCategoryId,
  onCategoryChange,
  disabled = false,
}: CategoryFilterProps) {
  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value

    if (value === '') {
      onCategoryChange(null)
      return
    }

    onCategoryChange(Number(value))
  }

  return (
    <label className="mh-category-filter">
      <span>Kategorie</span>

      <select
        value={selectedCategoryId ?? ''}
        onChange={handleChange}
        disabled={disabled}
      >
        <option value="">Alle Kategorien</option>

        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </label>
  )
}

export default CategoryFilter