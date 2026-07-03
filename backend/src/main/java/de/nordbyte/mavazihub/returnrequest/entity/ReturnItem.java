package de.nordbyte.mavazihub.returnrequest.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "return_item")
@Getter
@Setter
public class ReturnItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "return_request_id", nullable = false)
    @JsonIgnore
    private ReturnRequest returnRequest;

    /**
     * Referenz auf die ursprüngliche OrderItem-Position.
     * Kein @ManyToOne auf OrderItem, um Modulkopplung gering zu halten -
     * order_item_id wird als reine FK-Referenz gespeichert (ADR-05-Prinzip).
     */
    @Column(name = "order_item_id", nullable = false)
    private UUID orderItemId;

    @Column(nullable = false)
    private Integer quantity;
}
