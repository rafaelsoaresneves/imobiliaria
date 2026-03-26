package com.rafadev.imobliaria.repository;

import com.rafadev.imobliaria.entity.Lead;
import com.rafadev.imobliaria.entity.enums.StatusLead;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeadRepository extends JpaRepository<Lead, Long> {
    List<Lead> findByStatus(StatusLead status);
}
