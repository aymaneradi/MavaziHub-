package de.nordbyte.mavazihub.token.service;

import de.nordbyte.mavazihub.token.entity.RefreshToken;
import de.nordbyte.mavazihub.user.entity.User;

public interface RefreshTokenService {
    RefreshToken createRefreshToken(User user);
    RefreshToken validateRefreshToken(String token);
    void revokeRefreshToken(String token);
}
