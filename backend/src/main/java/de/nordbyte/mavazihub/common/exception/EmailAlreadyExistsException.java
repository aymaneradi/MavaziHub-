package de.nordbyte.mavazihub.common.exception;

public class EmailAlreadyExistsException extends RuntimeException{
    public EmailAlreadyExistsException(String message){
        super("Email already exists: " + message);
    }
}
