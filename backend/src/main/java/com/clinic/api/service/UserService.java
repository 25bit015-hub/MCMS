package com.clinic.api.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.clinic.api.dto.ChangePasswordRequest;
import com.clinic.api.dto.UpdateUserRequest;
import com.clinic.api.dto.UserRequest;
import com.clinic.api.dto.UserResponse;
import com.clinic.api.entity.Role;
import com.clinic.api.entity.User;
import com.clinic.api.repository.RoleRepository;
import com.clinic.api.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // =========================
    // GET ALL USERS
    // =========================

    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(this::toUserResponse)
                .toList();
    }

    // =========================
    // GET USER BY ID
    // =========================

    public UserResponse getUserById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with id: " + id
                        )
                );

        return toUserResponse(user);
    }

    // =========================
// GET CURRENT LOGGED-IN USER
// =========================

public UserResponse getCurrentUser(String username) {

    User user = userRepository.findByUsername(username)
            .orElseThrow(() ->
                    new RuntimeException(
                            "Current user not found: " + username
                    )
            );

    return toUserResponse(user);
}

// =========================
// CHANGE CURRENT USER PASSWORD
// =========================

public void changePassword(
        String username,
        ChangePasswordRequest request
) {

    User user = userRepository.findByUsername(username)
            .orElseThrow(() ->
                    new RuntimeException(
                            "Current user not found: " + username
                    )
            );

    if (request.getCurrentPassword() == null
            || request.getCurrentPassword().isBlank()) {

        throw new RuntimeException(
                "Current password is required"
        );
    }

    if (request.getNewPassword() == null
            || request.getNewPassword().isBlank()) {

        throw new RuntimeException(
                "New password is required"
        );
    }

    if (request.getConfirmPassword() == null
            || request.getConfirmPassword().isBlank()) {

        throw new RuntimeException(
                "Confirm password is required"
        );
    }

    // Hakikisha password ya zamani ni sahihi
    if (!passwordEncoder.matches(
            request.getCurrentPassword(),
            user.getPassword()
    )) {

        throw new RuntimeException(
                "Current password is incorrect"
        );
    }

    // Hakikisha password mpya zinafanana
    if (!request.getNewPassword()
            .equals(request.getConfirmPassword())) {

        throw new RuntimeException(
                "New password and confirm password do not match"
        );
    }

    // Password mpya iwe tofauti na ya zamani
    if (passwordEncoder.matches(
            request.getNewPassword(),
            user.getPassword()
    )) {

        throw new RuntimeException(
                "New password must be different from current password"
        );
    }

    // Encrypt password mpya kwa BCrypt
    user.setPassword(
            passwordEncoder.encode(
                    request.getNewPassword()
            )
    );

    userRepository.save(user);
}

    // =========================
    // CREATE USER
    // =========================

    public UserResponse createUser(UserRequest request) {

        if (userRepository.existsByUsername(
                request.getUsername()
        )) {
            throw new RuntimeException(
                    "Username already exists"
            );
        }

        if (userRepository.existsByEmail(
                request.getEmail()
        )) {
            throw new RuntimeException(
                    "Email already exists"
            );
        }

        Role role = roleRepository.findById(
                request.getRoleId()
        ).orElseThrow(() ->
                new RuntimeException(
                        "Role not found with id: "
                                + request.getRoleId()
                )
        );

        User user = new User();

        user.setFullName(
                request.getFullName()
        );

        user.setUsername(
                request.getUsername()
        );

        user.setEmail(
                request.getEmail()
        );

        user.setPhone(
                request.getPhone()
        );

        // BCrypt password
        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setRole(role);

        user.setActive(
                request.isActive()
        );

        User savedUser =
                userRepository.save(user);

        return toUserResponse(savedUser);
    }

    // =========================
    // UPDATE USER
    // =========================

    public UserResponse updateUser(
            Long id,
            UpdateUserRequest request
    ) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with id: "
                                        + id
                        )
                );

        // Check username
        if (userRepository.existsByUsername(
                request.getUsername()
        )
                && !user.getUsername()
                        .equals(request.getUsername())) {

            throw new RuntimeException(
                    "Username already exists"
            );
        }

        // Check email
        if (userRepository.existsByEmail(
                request.getEmail()
        )
                && !user.getEmail()
                        .equals(request.getEmail())) {

            throw new RuntimeException(
                    "Email already exists"
            );
        }

        // Find role
        Role role = roleRepository.findById(
                request.getRoleId()
        ).orElseThrow(() ->
                new RuntimeException(
                        "Role not found with id: "
                                + request.getRoleId()
                )
        );

        user.setFullName(
                request.getFullName()
        );

        user.setUsername(
                request.getUsername()
        );

        user.setEmail(
                request.getEmail()
        );

        user.setPhone(
                request.getPhone()
        );

        user.setRole(role);

        user.setActive(
                request.isActive()
        );

        /*
         * Kama password mpya imejazwa,
         * ibadilishwe.
         *
         * Kama ni tupu,
         * password ya zamani ibaki.
         */
        if (request.getPassword() != null
                && !request.getPassword().isBlank()) {

            user.setPassword(
                    passwordEncoder.encode(
                            request.getPassword()
                    )
            );
        }

        User updatedUser =
                userRepository.save(user);

        return toUserResponse(updatedUser);
    }

    // =========================
    // UPLOAD PROFILE PHOTO
    // =========================

    public UserResponse uploadProfilePhoto(
            Long id,
            MultipartFile file
    ) {

        if (file == null || file.isEmpty()) {

            throw new RuntimeException(
                    "Profile photo is required"
            );
        }

        String contentType =
                file.getContentType();

        if (contentType == null
                || !contentType.startsWith("image/")) {

            throw new RuntimeException(
                    "Only image files are allowed"
            );
        }

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with id: "
                                        + id
                        )
                );

        try {

            /*
             * Folder ya kuhifadhi profile photos.
             */
            Path uploadDirectory =
                    Paths.get(
                            "uploads/profile-photos"
                    );

            Files.createDirectories(
                    uploadDirectory
            );

            /*
             * Pata extension ya picha.
             */
            String originalName =
                    file.getOriginalFilename();

            String extension = "";

            if (originalName != null
                    && originalName.contains(".")) {

                extension =
                        originalName.substring(
                                originalName
                                        .lastIndexOf(".")
                        );
            }

            /*
             * Tengeneza filename unique.
             */
            String fileName =
                    UUID.randomUUID()
                            + extension;

            Path filePath =
                    uploadDirectory.resolve(
                            fileName
                    );

            /*
             * Save picha kwenye folder.
             */
            Files.copy(
                    file.getInputStream(),
                    filePath
            );

            /*
             * Save path kwenye database.
             */
            user.setProfilePhoto(
                    "/uploads/profile-photos/"
                            + fileName
            );

            User updatedUser =
                    userRepository.save(user);

            return toUserResponse(
                    updatedUser
            );

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to save profile photo",
                    e
            );
        }
    }

    // =========================
    // CONVERT USER TO RESPONSE
    // =========================

    private UserResponse toUserResponse(
            User user
    ) {

        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getUsername(),
                user.getEmail(),
                user.getPhone(),
                user.getProfilePhoto(),
                user.getRole().getId(),
                user.getRole().getName(),
                user.isActive(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}