package br.com.fiap.nous_sight.exception;

/**
 * Thrown when a requested record (or a record referenced by id) does not exist. Mapped to 404.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
