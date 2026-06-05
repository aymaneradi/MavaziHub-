package de.nordbyte.mavazihub.common.execption;

/**
 * Beschreibt fachliche Fehler während der Verarbeitung.
 */
public class BusinessException extends RuntimeException {

    /**
     * Erstellt eine fachliche Ausnahme mit Fehlermeldung.
     */
    public BusinessException(String message) {
        super(message);
    }
}