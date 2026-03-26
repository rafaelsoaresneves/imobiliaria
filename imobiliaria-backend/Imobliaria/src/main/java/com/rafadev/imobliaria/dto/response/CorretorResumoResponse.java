package com.rafadev.imobliaria.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CorretorResumoResponse {
    private Long id;
    private String nome;
    private String creci;
    private String foto;
}
