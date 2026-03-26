package com.rafadev.imobliaria.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class PageResponse<T> {
    private List<T> conteudo;
    private int pagina;
    private int tamanhoPagina;
    private long totalElementos;
    private int totalPaginas;
    private boolean ultima;
}
