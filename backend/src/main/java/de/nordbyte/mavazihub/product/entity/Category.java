package de.nordbyte.mavazihub.product.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Repräsentiert eine Produktkategorie im System.
 */
@Entity
@Table(
        name = "categories",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_categories_name", columnNames = "name")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    /**
     * Aktualisiert die Stammdaten einer bestehenden Kategorie.
     */
    public void update(String name, String description) {
        this.name = name;
        this.description = description;
    }
}