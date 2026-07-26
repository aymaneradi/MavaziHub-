import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { adminApi } from '../../api'
import { useAuth } from '../../auth/AuthContext'
import type { OrderResponse, ProductResponse, ReturnRequestResponseDTO, UserRole } from '../../types'

type DashboardMetrics = {
  openOrders: number
  openReturns: number
  lowStockProducts: number
  inactiveProducts: number
}

const emptyMetrics: DashboardMetrics = {
  openOrders: 0,
  openReturns: 0,
  lowStockProducts: 0,
  inactiveProducts: 0,
}

const openOrderStatuses = new Set(['CREATED', 'PAID', 'PROCESSING', 'SHIPPED'])
const openReturnStatuses = new Set(['REQUESTED', 'IN_REVIEW', 'APPROVED', 'RECEIVED'])
const lowStockLimit = 10

const dashboardLinks = [
  {
    to: '/admin/products',
    title: 'Produkte',
    text: 'Produkte anlegen, bearbeiten und veröffentlichen.',
  },
  {
    to: '/admin/categories',
    title: 'Kategorien',
    text: 'Kategorien für den Shop strukturieren.',
  },
  {
    to: '/admin/orders',
    title: 'Bestellungen',
    text: 'Bestellungen prüfen und Status anpassen.',
  },
  {
    to: '/admin/returns',
    title: 'Retouren',
    text: 'Rücksendungen einsehen und bearbeiten.',
  },
  {
    to: '/admin/users',
    title: 'Nutzer',
    text: 'Zugänge und Rollen verwalten.',
    roles: ['ROLE_ADMIN'] satisfies UserRole[],
  },
]

export function AdminDashboardPage() {
  const auth = useAuth()
  const [metrics, setMetrics] = useState<DashboardMetrics>(emptyMetrics)
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true)
  const [message, setMessage] = useState('')
  const visibleLinks = dashboardLinks.filter((link) => !link.roles || auth.hasAnyRole(link.roles))
  const areaLabel = auth.hasAnyRole(['ROLE_ADMIN']) ? 'Adminbereich' : 'Mitarbeiterbereich'

  useEffect(() => {
    let isMounted = true

    async function loadMetrics() {
      const [ordersResult, returnsResult, productsResult] = await Promise.allSettled([
        adminApi.getOrders(),
        adminApi.getReturns(),
        adminApi.getProducts(),
      ])

      if (!isMounted) {
        return
      }

      const orders: OrderResponse[] = ordersResult.status === 'fulfilled' ? ordersResult.value : []
      const returns: ReturnRequestResponseDTO[] =
        returnsResult.status === 'fulfilled' ? returnsResult.value : []
      const products: ProductResponse[] =
        productsResult.status === 'fulfilled' ? productsResult.value : []

      setMetrics({
        openOrders: orders.filter((order) => openOrderStatuses.has(order.status)).length,
        openReturns: returns.filter((returnRequest) => openReturnStatuses.has(returnRequest.status))
          .length,
        lowStockProducts: products.filter(
          (product) =>
            product.active &&
            product.stockQuantity > 0 &&
            product.stockQuantity <= lowStockLimit,
        ).length,
        inactiveProducts: products.filter((product) => !product.active).length,
      })

      if (
        ordersResult.status === 'rejected' ||
        returnsResult.status === 'rejected' ||
        productsResult.status === 'rejected'
      ) {
        setMessage('Einige Kennzahlen konnten gerade nicht geladen werden.')
      }

      setIsLoadingMetrics(false)
    }

    void loadMetrics()

    return () => {
      isMounted = false
    }
  }, [])

  const metricCards = [
    {
      to: '/admin/orders',
      label: 'Offene Bestellungen',
      value: metrics.openOrders,
      text: 'Noch nicht abgeschlossen',
    },
    {
      to: '/admin/returns',
      label: 'Offene Retouren',
      value: metrics.openReturns,
      text: 'Warten auf Bearbeitung',
    },
    {
      to: '/admin/products',
      label: 'Niedriger Bestand',
      value: metrics.lowStockProducts,
      text: `Aktive Produkte mit ${lowStockLimit} oder weniger`,
    },
    {
      to: '/admin/products',
      label: 'Deaktivierte Produkte',
      value: metrics.inactiveProducts,
      text: 'Derzeit nicht sichtbar im Shop',
    },
  ]

  return (
    <section className="admin-workspace">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">{areaLabel}</p>
          <h1>Dashboard</h1>
          <p>Alles Wichtige für Shop-Betrieb und Kundenservice an einem Ort.</p>
        </div>
      </div>

      {message && <p className="admin-message" role="status">{message}</p>}

      <div className="admin-metrics-grid" aria-label="Shop-Kennzahlen">
        {metricCards.map((metric) => (
          <Link className="admin-metric-card" key={metric.label} to={metric.to}>
            <span>{metric.label}</span>
            <strong>{isLoadingMetrics ? '...' : metric.value}</strong>
            <small>{metric.text}</small>
          </Link>
        ))}
      </div>

      <div className="admin-dashboard-grid">
        {visibleLinks.map((link) => (
          <Link className="admin-dashboard-card" key={link.to} to={link.to}>
            <span>{link.title}</span>
            <p>{link.text}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
