package com.clinic.api.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.clinic.api.dto.ChangePasswordRequest;
import com.clinic.api.dto.UpdateUserRequest;
import com.clinic.api.dto.UserRequest;
import com.clinic.api.dto.UserResponse;
import com.clinic.api.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // =========================
    // GET ALL USERS
    // =========================

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        return ResponseEntity.ok(
                userService.getAllUsers()
        );
    }

    // =========================
    // GET USER BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                userService.getUserById(id)
        );
    }

    // =========================
    // GET CURRENT LOGGED-IN USER
    // =========================

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                userService.getCurrentUser(
                        authentication.getName()
                )
        );
    }

    // =========================
    // UPDATE CURRENT LOGGED-IN USER
    // =========================

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(
            Authentication authentication,
            @RequestBody UpdateUserRequest request
    ) {

        UserResponse currentUser =
                userService.getCurrentUser(
                        authentication.getName()
                );

        return ResponseEntity.ok(
                userService.updateUser(
                        currentUser.getId(),
                        request
                )
        );
    }

    // =========================
// CHANGE CURRENT USER PASSWORD
// =========================

@PutMapping("/me/password")
public ResponseEntity<Void> changePassword(
        Authentication authentication,
        @RequestBody ChangePasswordRequest request
) {

    userService.changePassword(
            authentication.getName(),
            request
    );

    return ResponseEntity.noContent().build();
}

    // =========================
    // CREATE USER
    // =========================

    @PostMapping
    public ResponseEntity<UserResponse> createUser(
            @RequestBody UserRequest request
    ) {

        return ResponseEntity.ok(
                userService.createUser(request)
        );
    }

    // =========================
    // UPDATE USER BY ID
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request
    ) {

        return ResponseEntity.ok(
                userService.updateUser(
                        id,
                        request
                )
        );
    }

    // =========================
    // UPLOAD PROFILE PHOTO
    // =========================

    @PostMapping("/{id}/profile-photo")
    public ResponseEntity<UserResponse> uploadProfilePhoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {

        return ResponseEntity.ok(
                userService.uploadProfilePhoto(
                        id,
                        file
                )
        );
    }
}