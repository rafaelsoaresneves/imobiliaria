package com.rafadev.imobliaria;

import com.rafadev.imobliaria.dto.request.ImovelRequest;
import com.rafadev.imobliaria.dto.response.ImovelResponse;
import com.rafadev.imobliaria.dto.response.PageResponse;
import com.rafadev.imobliaria.exception.EntityNotFoundException;
import com.rafadev.imobliaria.service.ImovelService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ImovelServiceTest {

    @Autowired
    private ImovelService imovelService;

    private ImovelRequest novoImovelRequest() {
        ImovelRequest req = new ImovelRequest();
        req.setTitulo("Apartamento no Centro");
        req.setTipo("APARTAMENTO");
        req.setFinalidade("VENDA");
        req.setPreco(new BigDecimal("450000"));
        req.setArea(80.0);
        req.setQuartos(3);
        req.setBanheiros(2);
        req.setVagas(1);
        req.setBairro("Centro");
        req.setCidade("São Paulo");
        req.setEstado("SP");
        req.setFotos(List.of("/api/files/foto1.jpg"));
        return req;
    }

    @Test
    void criarImovelRetornaImovelComId() {
        ImovelResponse response = imovelService.criar(novoImovelRequest());

        assertThat(response.getId()).isNotNull();
        assertThat(response.getTitulo()).isEqualTo("Apartamento no Centro");
        assertThat(response.getTipo()).isEqualTo("APARTAMENTO");
        assertThat(response.getFinalidade()).isEqualTo("VENDA");
    }

    @Test
    void listarComFiltroFinalidadeRetornaApenasVenda() {
        ImovelRequest venda = novoImovelRequest();
        venda.setFinalidade("VENDA");
        imovelService.criar(venda);

        ImovelRequest aluguel = novoImovelRequest();
        aluguel.setFinalidade("ALUGUEL");
        aluguel.setTitulo("Apartamento para Aluguel");
        imovelService.criar(aluguel);

        PageResponse<ImovelResponse> result = imovelService.listar(
                "VENDA", null, null, null, null, null, null, null, null, 0, 10, "criadoEm,desc");

        assertThat(result.getConteudo()).hasSize(1);
        assertThat(result.getConteudo().get(0).getFinalidade()).isEqualTo("VENDA");
    }

    @Test
    void buscarPorIdInexistenteLeancaExcecao() {
        assertThatThrownBy(() -> imovelService.buscarPorId(999L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void removerImovelRemoveDoBanco() {
        ImovelResponse criado = imovelService.criar(novoImovelRequest());
        imovelService.remover(criado.getId());

        assertThatThrownBy(() -> imovelService.buscarPorId(criado.getId()))
                .isInstanceOf(EntityNotFoundException.class);
    }
}
