package br.com.fiap.nous_sight.domain;

/**
 * Human validation status of a generated alert.
 * Stored in ALERTA_GERADO.STATUS_VALIDACAO through {@link ValidationStatusConverter}.
 */
public enum ValidationStatus {
    PENDING,
    VALIDATED,
    CORRECTED
}
