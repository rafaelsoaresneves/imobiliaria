package com.rafadev.imobliaria.service;

import com.rafadev.imobliaria.dto.request.ImovelRequest;
import com.rafadev.imobliaria.dto.response.CorretorResumoResponse;
import com.rafadev.imobliaria.dto.response.ImovelResponse;
import com.rafadev.imobliaria.dto.response.PageResponse;
import com.rafadev.imobliaria.entity.Corretor;
import com.rafadev.imobliaria.entity.Imovel;
import com.rafadev.imobliaria.entity.enums.Finalidade;
import com.rafadev.imobliaria.entity.enums.TipoImovel;
import com.rafadev.imobliaria.exception.EntityNotFoundException;
import com.rafadev.imobliaria.repository.CorretorRepository;
import com.rafadev.imobliaria.repository.ImovelRepository;
import com.rafadev.imobliaria.repository.ImovelSpec;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class ImovelService {

    private final ImovelRepository imovelRepository;
    private final CorretorRepository corretorRepository;

    public PageResponse<ImovelResponse> listar(
            String finalidadeStr, String tipoStr,
            BigDecimal precoMin, BigDecimal precoMax,
            Integer quartos, String bairro, String cidade,
            Boolean destaque, String search,
            int page, int size, String sort) {

        Finalidade finalidade = parseEnum(Finalidade.class, finalidadeStr);
        TipoImovel tipo = parseEnum(TipoImovel.class, tipoStr);

        String[] sortParts = sort != null ? sort.split(",") : new String[]{"criadoEm", "desc"};
        String sortField = sortParts[0];
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));

        Page<Imovel> resultPage = imovelRepository.findAll(
                ImovelSpec.build(finalidade, tipo, precoMin, precoMax, quartos, bairro, cidade, destaque, search),
                pageable);

        return new PageResponse<>(
                resultPage.getContent().stream().map(this::toResponse).toList(),
                resultPage.getNumber(),
                resultPage.getSize(),
                resultPage.getTotalElements(),
                resultPage.getTotalPages(),
                resultPage.isLast());
    }

    public ImovelResponse buscarPorId(Long id) {
        return toResponse(findById(id));
    }

    public ImovelResponse criar(ImovelRequest request) {
        Imovel imovel = buildFromRequest(new Imovel(), request);
        return toResponse(imovelRepository.save(imovel));
    }

    public ImovelResponse atualizar(Long id, ImovelRequest request) {
        Imovel imovel = buildFromRequest(findById(id), request);
        return toResponse(imovelRepository.save(imovel));
    }

    public void remover(Long id) {
        findById(id);
        imovelRepository.deleteById(id);
    }

    private Imovel buildFromRequest(Imovel imovel, ImovelRequest request) {
        imovel.setTitulo(request.getTitulo());
        imovel.setTipo(TipoImovel.valueOf(request.getTipo().toUpperCase()));
        imovel.setFinalidade(Finalidade.valueOf(request.getFinalidade().toUpperCase()));
        imovel.setPreco(request.getPreco());
        imovel.setArea(request.getArea());
        imovel.setQuartos(request.getQuartos());
        imovel.setBanheiros(request.getBanheiros());
        imovel.setVagas(request.getVagas());
        imovel.setBairro(request.getBairro());
        imovel.setCidade(request.getCidade());
        imovel.setEstado(request.getEstado());
        imovel.setCep(request.getCep());
        imovel.setEndereco(request.getEndereco());
        imovel.setDescricao(request.getDescricao());
        imovel.setDestaque(request.isDestaque());
        imovel.setFotos(request.getFotos() != null ? request.getFotos() : new ArrayList<>());

        if (request.getCorretorId() != null) {
            Corretor corretor = corretorRepository.findById(request.getCorretorId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Corretor não encontrado com id: " + request.getCorretorId()));
            imovel.setCorretor(corretor);
        } else {
            imovel.setCorretor(null);
        }

        return imovel;
    }

    private Imovel findById(Long id) {
        return imovelRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Imóvel não encontrado com id: " + id));
    }

    private ImovelResponse toResponse(Imovel imovel) {
        CorretorResumoResponse corretorResumo = null;
        if (imovel.getCorretor() != null) {
            corretorResumo = CorretorResumoResponse.builder()
                    .id(imovel.getCorretor().getId())
                    .nome(imovel.getCorretor().getNome())
                    .creci(imovel.getCorretor().getCreci())
                    .foto(imovel.getCorretor().getFoto())
                    .build();
        }
        return ImovelResponse.builder()
                .id(imovel.getId())
                .titulo(imovel.getTitulo())
                .tipo(imovel.getTipo().name())
                .finalidade(imovel.getFinalidade().name())
                .preco(imovel.getPreco())
                .area(imovel.getArea())
                .quartos(imovel.getQuartos())
                .banheiros(imovel.getBanheiros())
                .vagas(imovel.getVagas())
                .bairro(imovel.getBairro())
                .cidade(imovel.getCidade())
                .estado(imovel.getEstado())
                .cep(imovel.getCep())
                .endereco(imovel.getEndereco())
                .descricao(imovel.getDescricao())
                .destaque(imovel.isDestaque())
                .fotos(imovel.getFotos())
                .corretor(corretorResumo)
                .criadoEm(imovel.getCriadoEm())
                .atualizadoEm(imovel.getAtualizadoEm())
                .build();
    }

    private <E extends Enum<E>> E parseEnum(Class<E> enumClass, String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Enum.valueOf(enumClass, value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Valor inválido para " + enumClass.getSimpleName() + ": " + value);
        }
    }
}
