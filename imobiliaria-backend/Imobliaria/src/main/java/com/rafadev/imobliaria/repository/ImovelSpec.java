package com.rafadev.imobliaria.repository;

import com.rafadev.imobliaria.entity.Imovel;
import com.rafadev.imobliaria.entity.enums.Finalidade;
import com.rafadev.imobliaria.entity.enums.TipoImovel;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ImovelSpec {

    public static Specification<Imovel> build(
            Finalidade finalidade,
            TipoImovel tipo,
            BigDecimal precoMin,
            BigDecimal precoMax,
            Integer quartos,
            String bairro,
            String cidade,
            Boolean destaque,
            String search) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (finalidade != null) {
                predicates.add(cb.equal(root.get("finalidade"), finalidade));
            }
            if (tipo != null) {
                predicates.add(cb.equal(root.get("tipo"), tipo));
            }
            if (precoMin != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("preco"), precoMin));
            }
            if (precoMax != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("preco"), precoMax));
            }
            if (quartos != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("quartos"), quartos));
            }
            if (bairro != null && !bairro.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("bairro")), "%" + bairro.toLowerCase() + "%"));
            }
            if (cidade != null && !cidade.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("cidade")), "%" + cidade.toLowerCase() + "%"));
            }
            if (destaque != null) {
                predicates.add(cb.equal(root.get("destaque"), destaque));
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("titulo")), pattern),
                    cb.like(cb.lower(root.get("bairro")), pattern),
                    cb.like(cb.lower(root.get("cidade")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
