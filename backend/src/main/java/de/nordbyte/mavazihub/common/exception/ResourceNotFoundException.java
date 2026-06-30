package de.nordbyte.mavazihub.common.exception;

/**
 * Beschreibt den Fall, dass eine angeforderte Ressource nicht gefunden wurde.
 */
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Erstellt eine Ausnahme mit Fehlermeldung.
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }
}