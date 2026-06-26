package de.nordbyte.mavazihub.product.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Repräsentiert eine konkrete Variante eines Produkts.
 */
@Entity
@Table(name = "product_variants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(length = 50)
    private String size;

    @Column(length = 80)
    private String color;

    @Column(length = 100)
    private String pattern;

    @Column(nullable = false)
    private int stockQuantity;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    /**
     * Aktualisiert die Variantendaten.
     */
    public void update(String size, String color, String pattern) {
        this.size = size;
        this.color = color;
        this.pattern = pattern;
    }

    /**
     * Aktualisiert den Lagerbestand.
     */
    public void updateStock(int stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    /**
     * Prüft, ob genügend Bestand vorhanden ist.
     */
    public boolean hasEnoughStock(int quantity) {
        return stockQuantity >= quantity;
    }

    /**
     * Reduziert den Lagerbestand um die angegebene Menge.
     */
    public void reduceStock(int quantity) {
        this.stockQuantity -= quantity;
    }

    /**
     * Deaktiviert die Variante.
     */
    public void deactivate() {
        this.active = false;
    }

    /**
     * Aktiviert die Variante.
     */
    public void activate() {
        this.active = true;
    }

    /**
     * Gibt eine lesbare Bezeichnung der Variante zurück.
     */
    public String getVariantLabel() {
        StringBuilder label = new StringBuilder();
        if (size != null && !size.isBlank())    label.append(size);
        if (color != null && !color.isBlank())  {
            if (!label.isEmpty()) label.append(" / ");
            label.append(color);
        }
        if (pattern != null && !pattern.isBlank()) {
            if (!label.isEmpty()) label.append(" / ");
            label.append(pattern);
        }
        return label.isEmpty() ? null : label.toString();
    }
}