package de.nordbyte.mavazihub.cart.service;

import de.nordbyte.mavazihub.cart.dto.CartItemRequest;
import de.nordbyte.mavazihub.cart.repository.CartItemRepository;
import de.nordbyte.mavazihub.common.exception.BusinessException;
import de.nordbyte.mavazihub.product.entity.Product;
import de.nordbyte.mavazihub.product.service.ProductService;
import de.nordbyte.mavazihub.product.service.ProductVariantService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductService productService;

    @Mock
    private ProductVariantService productVariantService;

    @InjectMocks
    private CartService cartService;

    @Test
    void addToCartRejectsVariantProductWithoutVariantSelection() {
        Long productId = 12L;
        CartItemRequest request = new CartItemRequest();
        request.setProductId(productId);
        request.setQuantity(1);

        Product product = Product.builder()
                .id(productId)
                .name("Kente Shirt")
                .price(BigDecimal.valueOf(49.99))
                .stockQuantity(20)
                .active(true)
                .build();

        when(productService.getActiveProductEntityOrThrow(productId)).thenReturn(product);
        when(productVariantService.hasActiveVariants(productId)).thenReturn(true);

        assertThatThrownBy(() -> cartService.addToCart(UUID.randomUUID(), request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Variante");
    }

    @Test
    void addToCartRejectsMissingQuantity() {
        CartItemRequest request = new CartItemRequest();
        request.setProductId(12L);

        assertThatThrownBy(() -> cartService.addToCart(UUID.randomUUID(), request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Menge");
    }
}
