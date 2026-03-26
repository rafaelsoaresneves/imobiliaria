package com.rafadev.imobliaria;

import com.rafadev.imobliaria.dto.request.LoginRequest;
import com.rafadev.imobliaria.dto.response.LoginResponse;
import com.rafadev.imobliaria.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Test
    void loginComCredenciaisCorretasRetornaToken() {
        LoginRequest request = new LoginRequest();
        request.setUsuario("admin");
        request.setSenha("admin123");

        LoginResponse response = authService.login(request);

        assertThat(response.getToken()).isNotBlank();
        assertThat(response.getTipo()).isEqualTo("Bearer");
    }

    @Test
    void loginComCredenciaisErradasLancaExcecao() {
        LoginRequest request = new LoginRequest();
        request.setUsuario("admin");
        request.setSenha("errada");

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class);
    }
}
