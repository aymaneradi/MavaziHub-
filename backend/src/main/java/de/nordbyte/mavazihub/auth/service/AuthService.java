package de.nordbyte.mavazihub.auth.service;

import de.nordbyte.mavazihub.auth.dto.AuthResponse;
import de.nordbyte.mavazihub.auth.dto.LoginRequest;
import de.nordbyte.mavazihub.auth.dto.LogoutRequest;
import de.nordbyte.mavazihub.auth.dto.RegisterRequest;
import de.nordbyte.mavazihub.token.dto.RefreshRequest;

public interface AuthService {
    void register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refresh(RefreshRequest request);
    void logout (LogoutRequest request);
}
