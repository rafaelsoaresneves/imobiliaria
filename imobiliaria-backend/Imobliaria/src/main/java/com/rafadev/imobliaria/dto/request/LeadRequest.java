package com.rafadev.imobliaria.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LeadRequest {
    @NotBlank
    private String nome;
    @NotBlank
    @Email
    private String email;
    private String telefone;
    private String interesse;
    private String mensagem;
    private String origem;
}
