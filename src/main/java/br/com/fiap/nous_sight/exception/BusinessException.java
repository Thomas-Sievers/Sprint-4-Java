package br.com.fiap.nous_sight.exception;

/**
 * Thrown when a request breaks a business rule. Mapped to 422.
 */
public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }
}
