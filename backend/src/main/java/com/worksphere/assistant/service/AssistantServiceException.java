package com.worksphere.assistant.service;

import org.springframework.http.HttpStatus;

public class AssistantServiceException extends RuntimeException {

    private final HttpStatus status;

    public AssistantServiceException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
