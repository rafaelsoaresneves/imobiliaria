package com.rafadev.imobliaria.service;

import com.rafadev.imobliaria.dto.request.CorretorRequest;
import com.rafadev.imobliaria.dto.response.CorretorResponse;
import com.rafadev.imobliaria.entity.Corretor;
import com.rafadev.imobliaria.exception.EntityNotFoundException;
import com.rafadev.imobliaria.repository.CorretorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CorretorService {

    private final CorretorRepository corretorRepository;

    public List<CorretorResponse> listarTodos() {
        return corretorRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CorretorResponse buscarPorId(Long id) {
        return toResponse(findById(id));
    }

    public CorretorResponse criar(CorretorRequest request) {
        Corretor corretor = Corretor.builder()
                .nome(request.getNome())
                .creci(request.getCreci())
                .telefone(request.getTelefone())
                .email(request.getEmail())
                .especialidade(request.getEspecialidade())
                .foto(request.getFoto())
                .bio(request.getBio())
                .build();
        return toResponse(corretorRepository.save(corretor));
    }

    public CorretorResponse atualizar(Long id, CorretorRequest request) {
        Corretor corretor = findById(id);
        corretor.setNome(request.getNome());
        corretor.setCreci(request.getCreci());
        corretor.setTelefone(request.getTelefone());
        corretor.setEmail(request.getEmail());
        corretor.setEspecialidade(request.getEspecialidade());
        corretor.setFoto(request.getFoto());
        corretor.setBio(request.getBio());
        return toResponse(corretorRepository.save(corretor));
    }

    public void remover(Long id) {
        findById(id);
        corretorRepository.deleteById(id);
    }

    private Corretor findById(Long id) {
        return corretorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Corretor não encontrado com id: " + id));
    }

    private CorretorResponse toResponse(Corretor c) {
        return CorretorResponse.builder()
                .id(c.getId())
                .nome(c.getNome())
                .creci(c.getCreci())
                .telefone(c.getTelefone())
                .email(c.getEmail())
                .especialidade(c.getEspecialidade())
                .foto(c.getFoto())
                .bio(c.getBio())
                .criadoEm(c.getCriadoEm())
                .atualizadoEm(c.getAtualizadoEm())
                .build();
    }
}
