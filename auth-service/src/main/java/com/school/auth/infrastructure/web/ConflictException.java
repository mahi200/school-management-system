package com.school.auth.infrastructure.web;

public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}

