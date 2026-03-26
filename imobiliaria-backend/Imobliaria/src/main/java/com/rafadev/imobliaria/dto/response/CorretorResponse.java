package com.rafadev.imobliaria.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CorretorResponse {
    private Long id;
    private String nome;
    private String creci;
    private String telefone;
    private String email;
    private String especialidade;
    private String foto;
    private String bio;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;
}
