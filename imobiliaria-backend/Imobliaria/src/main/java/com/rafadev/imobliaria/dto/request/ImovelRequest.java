package com.rafadev.imobliaria.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ImovelRequest {
    @NotBlank
    private String titulo;
    @NotBlank
    private String tipo;
    @NotBlank
    private String finalidade;
    @NotNull
    @Positive
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
    private boolean destaque = false;
    private List<String> fotos;
    private Long corretorId;
}
