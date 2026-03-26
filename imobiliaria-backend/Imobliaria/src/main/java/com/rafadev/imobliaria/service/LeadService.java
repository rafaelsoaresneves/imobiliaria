package com.rafadev.imobliaria.service;

import com.rafadev.imobliaria.dto.request.AtualizarStatusLeadRequest;
import com.rafadev.imobliaria.dto.request.LeadRequest;
import com.rafadev.imobliaria.dto.response.LeadResponse;
import com.rafadev.imobliaria.entity.Lead;
import com.rafadev.imobliaria.entity.enums.InteresseLead;
import com.rafadev.imobliaria.entity.enums.StatusLead;
import com.rafadev.imobliaria.exception.EntityNotFoundException;
import com.rafadev.imobliaria.repository.LeadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeadService {

    private final LeadRepository leadRepository;

    public List<LeadResponse> listarTodos(String statusStr) {
        if (statusStr != null && !statusStr.isBlank()) {
            StatusLead status = StatusLead.valueOf(statusStr.toUpperCase());
            return leadRepository.findByStatus(status).stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }
        return leadRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public LeadResponse criar(LeadRequest request) {
        InteresseLead interesse = null;
        if (request.getInteresse() != null && !request.getInteresse().isBlank()) {
            try {
                interesse = InteresseLead.valueOf(request.getInteresse().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Interesse inválido: " + request.getInteresse());
            }
        }

        Lead lead = Lead.builder()
                .nome(request.getNome())
                .email(request.getEmail())
                .telefone(request.getTelefone())
                .interesse(interesse)
                .mensagem(request.getMensagem())
                .status(StatusLead.NOVO)
                .origem(request.getOrigem())
                .build();

        return toResponse(leadRepository.save(lead));
    }

    public LeadResponse atualizarStatus(Long id, AtualizarStatusLeadRequest request) {
        Lead lead = findById(id);
        try {
            lead.setStatus(StatusLead.valueOf(request.getStatus().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Status inválido: " + request.getStatus());
        }
        return toResponse(leadRepository.save(lead));
    }

    private Lead findById(Long id) {
        return leadRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Lead não encontrado com id: " + id));
    }

    private LeadResponse toResponse(Lead lead) {
        return LeadResponse.builder()
                .id(lead.getId())
                .nome(lead.getNome())
                .email(lead.getEmail())
                .telefone(lead.getTelefone())
                .interesse(lead.getInteresse() != null ? lead.getInteresse().name() : null)
                .mensagem(lead.getMensagem())
                .status(lead.getStatus().name())
                .origem(lead.getOrigem())
                .criadoEm(lead.getCriadoEm())
                .atualizadoEm(lead.getAtualizadoEm())
                .build();
    }
}
