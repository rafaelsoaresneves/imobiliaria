package com.rafadev.imobliaria.controller;

import com.rafadev.imobliaria.dto.request.ImovelRequest;
import com.rafadev.imobliaria.dto.response.ImovelResponse;
import com.rafadev.imobliaria.dto.response.PageResponse;
import com.rafadev.imobliaria.service.ImovelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/imoveis")
@RequiredArgsConstructor
public class ImovelController {

    private final ImovelService imovelService;

    @GetMapping
    public ResponseEntity<PageResponse<ImovelResponse>> listar(
            @RequestParam(required = false) String finalidade,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) BigDecimal precoMin,
            @RequestParam(required = false) BigDecimal precoMax,
            @RequestParam(required = false) Integer quartos,
            @RequestParam(required = false) String bairro,
            @RequestParam(required = false) String cidade,
            @RequestParam(required = false) Boolean destaque,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "criadoEm,desc") String sort) {
        return ResponseEntity.ok(imovelService.listar(
                finalidade, tipo, precoMin, precoMax,
                quartos, bairro, cidade, destaque, search,
                page, size, sort));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ImovelResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(imovelService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<ImovelResponse> criar(@RequestBody @Valid ImovelRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(imovelService.criar(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ImovelResponse> atualizar(@PathVariable Long id,
                                                      @RequestBody @Valid ImovelRequest request) {
        return ResponseEntity.ok(imovelService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        imovelService.remover(id);
        return ResponseEntity.noContent().build();
    }
}
