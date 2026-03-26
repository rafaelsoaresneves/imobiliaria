package com.rafadev.imobliaria.controller;

import com.rafadev.imobliaria.dto.request.CorretorRequest;
import com.rafadev.imobliaria.dto.response.CorretorResponse;
import com.rafadev.imobliaria.service.CorretorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/corretores")
@RequiredArgsConstructor
public class CorretorController {

    private final CorretorService corretorService;

    @GetMapping
    public ResponseEntity<List<CorretorResponse>> listar() {
        return ResponseEntity.ok(corretorService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CorretorResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(corretorService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<CorretorResponse> criar(@RequestBody @Valid CorretorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(corretorService.criar(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CorretorResponse> atualizar(@PathVariable Long id,
                                                       @RequestBody @Valid CorretorRequest request) {
        return ResponseEntity.ok(corretorService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        corretorService.remover(id);
        return ResponseEntity.noContent().build();
    }
}
