package com.clinic.api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clinic.api.dto.LoginRequest;
import com.clinic.api.dto.LoginResponse;
import com.clinic.api.entity.User;
import com.clinic.api.repository.UserRepository;
import com.clinic.api.security.JwtService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthenticationManager authenticationManager;

    private final UserRepository userRepository;

    private final JwtService jwtService;

    public AuthController(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            JwtService jwtService
    ) {
        this.authenticationManager =
                authenticationManager;

        this.userRepository =
                userRepository;

        this.jwtService =
                jwtService;
    }

    // ==========================================
    // LOGIN
    // ==========================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request
    ) {

        try {

            Authentication authentication =
                    authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                        )
                    );

            User user =
                    userRepository
                        .findByUsernameOrEmail(
                            request.getUsername(),
                            request.getUsername()
                        )
                        .orElseThrow(() ->
                            new RuntimeException(
                                "User not found"
                            )
                        );

            String token =
                    jwtService.generateToken(
                        (org.springframework.security.core.userdetails.UserDetails)
                            authentication.getPrincipal()
                    );

            LoginResponse response =
                    new LoginResponse(
                        token,
                        "Bearer",
                        user.getId(),
                        user.getFullName(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getRole().getName()
                    );

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                        java.util.Map.of(
                            "message",
                            "Invalid username or password"
                        )
                    );
        }
    }
}