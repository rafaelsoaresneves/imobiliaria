package com.rafadev.imobliaria;

import com.rafadev.imobliaria.dto.request.AtualizarStatusLeadRequest;
import com.rafadev.imobliaria.dto.request.LeadRequest;
import com.rafadev.imobliaria.dto.response.LeadResponse;
import com.rafadev.imobliaria.service.LeadService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class LeadServiceTest {

    @Autowired
    private LeadService leadService;

    private LeadRequest novoLeadRequest() {
        LeadRequest req = new LeadRequest();
        req.setNome("Maria Oliveira");
        req.setEmail("maria@email.com");
        req.setTelefone("11988887777");
        req.setInteresse("COMPRA");
        req.setMensagem("Interesse em apartamento de 3 quartos");
        req.setOrigem("formulario-contato");
        return req;
    }

    @Test
    void criarLeadDefinStatusNovo() {
        LeadResponse response = leadService.criar(novoLeadRequest());

        assertThat(response.getId()).isNotNull();
        assertThat(response.getNome()).isEqualTo("Maria Oliveira");
        assertThat(response.getStatus()).isEqualTo("NOVO");
    }

    @Test
    void listarTodosRetornaLeads() {
        leadService.criar(novoLeadRequest());
        List<LeadResponse> lista = leadService.listarTodos(null);
        assertThat(lista).hasSize(1);
    }

    @Test
    void listarPorStatusFiltraCorretamente() {
        leadService.criar(novoLeadRequest());
        List<LeadResponse> novos = leadService.listarTodos("NOVO");
        List<LeadResponse> fechados = leadService.listarTodos("FECHADO");
        assertThat(novos).hasSize(1);
        assertThat(fechados).isEmpty();
    }

    @Test
    void atualizarStatusAlteraStatusDoLead() {
        LeadResponse criado = leadService.criar(novoLeadRequest());
        AtualizarStatusLeadRequest statusReq = new AtualizarStatusLeadRequest();
        statusReq.setStatus("EM_CONTATO");

        LeadResponse atualizado = leadService.atualizarStatus(criado.getId(), statusReq);

        assertThat(atualizado.getStatus()).isEqualTo("EM_CONTATO");
    }
}
