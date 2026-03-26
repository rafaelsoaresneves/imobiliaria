package com.rafadev.imobliaria.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AtualizarStatusLeadRequest {
    @NotBlank
    private String status;
}
