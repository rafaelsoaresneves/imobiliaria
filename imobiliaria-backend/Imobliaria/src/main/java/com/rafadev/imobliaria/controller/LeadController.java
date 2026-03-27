package com.rafadev.imobliaria.controller;

import com.rafadev.imobliaria.dto.request.AtualizarStatusLeadRequest;
import com.rafadev.imobliaria.dto.request.LeadRequest;
import com.rafadev.imobliaria.dto.response.LeadResponse;
import com.rafadev.imobliaria.service.LeadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leads")
@RequiredArgsConstructor
public class LeadController {

    private final LeadService leadService;

    @PostMapping
    public ResponseEntity<LeadResponse> criar(@RequestBody @Valid LeadRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leadService.criar(request));
    }

    @GetMapping
    public ResponseEntity<List<LeadResponse>> listar(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(leadService.listarTodos(status));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<LeadResponse> atualizarStatus(@PathVariable Long id,
                                                          @RequestBody @Valid AtualizarStatusLeadRequest request) {
        return ResponseEntity.ok(leadService.atualizarStatus(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        leadService.remover(id);
        return ResponseEntity.noContent().build();
    }
}
