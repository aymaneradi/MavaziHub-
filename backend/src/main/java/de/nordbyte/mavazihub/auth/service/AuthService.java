package de.nordbyte.mavazihub.auth.service;

import de.nordbyte.mavazihub.auth.dto.RegisterRequest;

public interface AuthService {
    void register(RegisterRequest request);
}
