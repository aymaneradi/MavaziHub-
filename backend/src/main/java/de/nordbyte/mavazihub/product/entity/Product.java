package de.nordbyte.mavazihub.product.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Repräsentiert ein Produkt im Produktkatalog.
 */
@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(length = 500)
    private String imageUrl;

    @Builder.Default
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, id ASC")
    private List<ProductImage> images = new ArrayList<>();

    @Column(nullable = false)
    private int stockQuantity;

    @Column(nullable = false)
    private boolean active;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    /**
     * Aktualisiert die Grunddaten eines Produkts.
     */
    public void updateBasicData(String name, String description, BigDecimal price, String imageUrl, int stockQuantity, Category category) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.stockQuantity = stockQuantity;
        this.category = category;
    }

    /**
     * Ersetzt alle Produktbilder in ihrer Anzeige-Reihenfolge.
     */
    public void replaceImages(List<String> imageUrls) {
        images.clear();

        for (int index = 0; index < imageUrls.size(); index++) {
            images.add(ProductImage.builder()
                    .product(this)
                    .imageUrl(imageUrls.get(index))
                    .altText(name)
                    .sortOrder(index)
                    .build());
        }
    }

    /**
     * Deaktiviert das Produkt für die öffentliche Anzeige.
     */
    public void deactivate() {
        this.active = false;
    }

    /**
     * Veröffentlicht das Produkt wieder im Shop.
     */
    public void publish() {
        this.active = true;
    }

    /**
     * Prüft, ob genügend Lagerbestand vorhanden ist.
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
}
