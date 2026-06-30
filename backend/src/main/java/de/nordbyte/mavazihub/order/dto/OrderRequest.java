package de.nordbyte.mavazihub.order.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class OrderRequest {
    private UUID customerId;
    private String street;
    private String zipCode;
    private String city;
}
