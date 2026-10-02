package com.clinic.api.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService
    ) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        System.out.println(
                "========== JWT FILTER =========="
        );

        System.out.println(
                "REQUEST: "
                        + request.getMethod()
                        + " "
                        + request.getRequestURI()
        );

        final String authHeader =
                request.getHeader("Authorization");

        System.out.println(
                "AUTH HEADER PRESENT: "
                        + (authHeader != null)
        );

        // Hakuna token
        if (authHeader == null
                || !authHeader.startsWith("Bearer ")) {

            System.out.println(
                    "JWT RESULT: NO BEARER TOKEN"
            );

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        // Toa token
        final String jwt =
                authHeader.substring(7);

        try {

            // Toa username ndani ya token
            final String username =
                    jwtService.extractUsername(jwt);

            System.out.println(
                    "JWT USERNAME: "
                            + username
            );

            // Kama user bado haja-authenticate
            if (username != null
                    && SecurityContextHolder
                        .getContext()
                        .getAuthentication() == null) {

                System.out.println(
                        "JWT: Loading user from database..."
                );

                // Tafuta user database
                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(
                                        username
                                );

                System.out.println(
                        "JWT USER FOUND: "
                                + userDetails.getUsername()
                );

                System.out.println(
                        "JWT AUTHORITIES: "
                                + userDetails.getAuthorities()
                );

                // Hakikisha token ni valid
                boolean valid =
                        jwtService.isTokenValid(
                                jwt,
                                userDetails
                        );

                System.out.println(
                        "JWT VALID: "
                                + valid
                );

                if (valid) {

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(
                                    authentication
                            );

                    System.out.println(
                            "JWT RESULT: AUTHENTICATED"
                    );

                } else {

                    System.out.println(
                            "JWT RESULT: INVALID TOKEN"
                    );
                }

            } else {

                System.out.println(
                        "JWT: Username is null OR user already authenticated"
                );
            }

        } catch (Exception e) {

            System.out.println(
                    "JWT ERROR TYPE: "
                            + e.getClass()
                                    .getSimpleName()
            );

            System.out.println(
                    "JWT ERROR MESSAGE: "
                            + e.getMessage()
            );

            e.printStackTrace();
        }

        System.out.println(
                "SECURITY AUTHENTICATION: "
                        + SecurityContextHolder
                                .getContext()
                                .getAuthentication()
        );

        filterChain.doFilter(
                request,
                response
        );

        System.out.println(
                "========== END JWT FILTER =========="
        );
    }
}