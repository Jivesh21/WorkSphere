package com.worksphere.assistant.controller;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class AssistantRequestSizeFilter extends OncePerRequestFilter {

    private static final String PATH = "/api/assistant/interpret";
    private static final long MAX_BODY_BYTES = 8192;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !"POST".equalsIgnoreCase(request.getMethod()) || !PATH.equals(request.getRequestURI());
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        long contentLength = request.getContentLengthLong();
        if (contentLength < 0 || contentLength > MAX_BODY_BYTES) {
            response.setStatus(contentLength < 0 ? HttpServletResponse.SC_LENGTH_REQUIRED : HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":false,\"message\":\"Request body must be at most 8192 bytes with a declared content length.\",\"data\":null}");
            return;
        }
        filterChain.doFilter(request, response);
    }
}
