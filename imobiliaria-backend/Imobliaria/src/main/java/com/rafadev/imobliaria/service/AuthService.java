package com.rafadev.imobliaria.service;

import com.rafadev.imobliaria.dto.request.LoginRequest;
import com.rafadev.imobliaria.dto.response.LoginResponse;
import com.rafadev.imobliaria.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    @Value("${admin.username}")
    private String adminUsername;

    @Value("${admin.password}")
    private String adminPassword;

    private final JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest request) {
        if (!request.getUsuario().equals(adminUsername) || !request.getSenha().equals(adminPassword)) {
            throw new BadCredentialsException("Usuário ou senha inválidos");
        }
        String token = jwtUtil.gerarToken(request.getUsuario());
        return new LoginResponse(token, "Bearer");
    }
}
