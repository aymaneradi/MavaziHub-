import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { adminApi } from '../../api'
import type { ProductVariantResponse, ProductDetailResponse } from '../../types'

export function AdminProductVariantsPage() {
    const { id } = useParams()
    const productId = Number(id) // On récupère l'ID du produit depuis l'URL

    const [product, setProduct] = useState<ProductDetailResponse | null>(null)
    const [variants, setVariants] = useState<ProductVariantResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [message, setMessage] = useState('')

    async function loadData() {
        try {
            const [productData, variantsData] = await Promise.all([
                adminApi.getProduct(productId),
                adminApi.getVariants(productId),
            ])
            setProduct(productData)
            setVariants(variantsData)
        } catch {
            setMessage('Fehler beim Laden des Produkts.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        void loadData()
    }, [productId])

    // VOICI LA FONCTION CORRIGÉE AVEC LES 3 ARGUMENTS
    async function handleUpdateStock(variantId: number, newStock: number) {
        try {
            // 1. productId, 2. variantId, 3. L'objet { stockQuantity: ... }
            await adminApi.updateVariantStock(productId, variantId, { stockQuantity: newStock })
            void loadData() // On recharge pour voir le changement
        } catch {
            alert('Fehler beim Speichern des Lagerbestands.')
        }
    }

    if (isLoading) return <p className="admin-muted p-4">Laden...</p>

    return (
        <section className="admin-workspace">
            <div className="admin-page-header">
                <div>
                    <p className="eyebrow">Lagerverwaltung</p>
                    <h1>Varianten für {product?.name}</h1>
                    <p>Bestände pro Größe et Farbe pflegen.</p>
                </div>
                <Link className="admin-secondary-link" to="/admin/products">
                    Zurück
                </Link>
            </div>

            {message && <p className="admin-message">{message}</p>}

            <div className="admin-panel">
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                        <tr>
                            <th>Bezeichnung</th>
                            <th>Größe</th>
                            <th>Farbe</th>
                            <th>Bestand</th>
                            <th>Aktion</th>
                        </tr>
                        </thead>
                        <tbody>
                        {variants.map((v) => (
                            <tr key={v.id}>
                                <td><strong>{v.variantLabel}</strong></td>
                                <td>{v.size}</td>
                                <td>{v.color || '-'}</td>
                                <td>
                                    <input
                                        style={{ width: '80px' }}
                                        type="number"
                                        defaultValue={v.stockQuantity}
                                        onBlur={(e) => handleUpdateStock(v.id, Number(e.target.value))}
                                    />
                                </td>
                                <td>
                                    <button type="button" className="admin-light-button">
                                        Speichern
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    )
}