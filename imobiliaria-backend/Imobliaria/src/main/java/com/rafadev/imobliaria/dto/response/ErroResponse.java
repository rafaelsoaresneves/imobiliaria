package com.rafadev.imobliaria.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ErroResponse {
    private int status;
    private String erro;
    private String mensagem;
    private LocalDateTime timestamp;
}
