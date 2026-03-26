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
public class LeadResponse {
    private Long id;
    private String nome;
    private String email;
    private String telefone;
    private String interesse;
    private String mensagem;
    private String status;
    private String origem;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;
}
