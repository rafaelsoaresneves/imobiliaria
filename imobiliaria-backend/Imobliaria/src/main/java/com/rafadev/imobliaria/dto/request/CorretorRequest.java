package com.rafadev.imobliaria.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CorretorRequest {
    @NotBlank
    private String nome;
    @NotBlank
    private String creci;
    private String telefone;
    @NotBlank
    @Email
    private String email;
    private String especialidade;
    private String foto;
    private String bio;
}
