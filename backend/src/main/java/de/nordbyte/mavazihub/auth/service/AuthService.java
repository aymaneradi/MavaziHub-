package de.nordbyte.mavazihub.auth.service;

import de.nordbyte.mavazihub.auth.dto.AuthResponse;
import de.nordbyte.mavazihub.auth.dto.LoginRequest;
import de.nordbyte.mavazihub.auth.dto.RegisterRequest;

public interface AuthService {
    void register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refresh(String refreshToken);
    void logout(String refreshToken);
}
