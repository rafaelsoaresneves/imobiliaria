package com.rafadev.imobliaria;

import com.rafadev.imobliaria.dto.request.CorretorRequest;
import com.rafadev.imobliaria.dto.response.CorretorResponse;
import com.rafadev.imobliaria.exception.EntityNotFoundException;
import com.rafadev.imobliaria.service.CorretorService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CorretorServiceTest {

    @Autowired
    private CorretorService corretorService;

    private CorretorRequest novoCorretorRequest() {
        CorretorRequest req = new CorretorRequest();
        req.setNome("João Silva");
        req.setCreci("12345-SP");
        req.setEmail("joao@imob.com");
        req.setTelefone("11999990000");
        req.setEspecialidade("Residencial");
        req.setBio("Especialista em residências");
        return req;
    }

    @Test
    void criarCorretorRetornaCorretorComId() {
        CorretorResponse response = corretorService.criar(novoCorretorRequest());

        assertThat(response.getId()).isNotNull();
        assertThat(response.getNome()).isEqualTo("João Silva");
        assertThat(response.getCreci()).isEqualTo("12345-SP");
    }

    @Test
    void listarCorretoresRetornaLista() {
        corretorService.criar(novoCorretorRequest());
        List<CorretorResponse> lista = corretorService.listarTodos();
        assertThat(lista).hasSize(1);
    }

    @Test
    void buscarPorIdInexistentelancaExcecao() {
        assertThatThrownBy(() -> corretorService.buscarPorId(999L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void atualizarCorretorAlteraCampos() {
        CorretorResponse criado = corretorService.criar(novoCorretorRequest());
        CorretorRequest atualizacao = novoCorretorRequest();
        atualizacao.setNome("João Santos");

        CorretorResponse atualizado = corretorService.atualizar(criado.getId(), atualizacao);

        assertThat(atualizado.getNome()).isEqualTo("João Santos");
    }

    @Test
    void removerCorretorRemoveDoBanco() {
        CorretorResponse criado = corretorService.criar(novoCorretorRequest());
        corretorService.remover(criado.getId());

        assertThatThrownBy(() -> corretorService.buscarPorId(criado.getId()))
                .isInstanceOf(EntityNotFoundException.class);
    }
}
