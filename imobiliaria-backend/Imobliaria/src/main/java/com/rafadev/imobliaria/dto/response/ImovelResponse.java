package com.rafadev.imobliaria.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImovelResponse {
    private Long id;
    private String titulo;
    private String tipo;
    private String finalidade;
    private BigDecimal preco;
    private Double area;
    private Integer quartos;
    private Integer banheiros;
    private Integer vagas;
    private String bairro;
    private String cidade;
    private String estado;
    private String cep;
    private String endereco;
    private String descricao;
    private boolean destaque;
    private List<String> fotos;
    private CorretorResumoResponse corretor;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;
}
