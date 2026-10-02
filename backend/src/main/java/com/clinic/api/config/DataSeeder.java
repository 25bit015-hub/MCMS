package com.clinic.api.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.clinic.api.entity.Role;
import com.clinic.api.entity.User;
import com.clinic.api.repository.RoleRepository;
import com.clinic.api.repository.UserRepository;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedData(
            RoleRepository roleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {

        return args -> {

            // ==========================================
            // CREATE ROLES
            // ==========================================

            String[] roles = {
                "ADMIN",
                "RECEPTION",
                "NURSE",
                "DOCTOR",
                "LABORATORY",
                "PHARMACIST",
                "CASHIER"
            };

            for (String roleName : roles) {

                if (!roleRepository.existsByName(roleName)) {

                    roleRepository.save(
                        new Role(roleName)
                    );

                    System.out.println(
                        "Created role: " + roleName
                    );
                }
            }


            // ==========================================
            // CREATE DEFAULT ADMIN
            // ==========================================

            if (!userRepository.existsByUsername("admin")) {

                Role adminRole = roleRepository
                        .findByName("ADMIN")
                        .orElseThrow(() ->
                            new RuntimeException(
                                "ADMIN role not found"
                            )
                        );

                User admin = new User();

                admin.setFullName(
                    "System Administrator"
                );

                admin.setUsername(
                    "admin"
                );

                admin.setEmail(
                    "admin@clinic.com"
                );

                admin.setPassword(
                    passwordEncoder.encode(
                        "Admin@123"
                    )
                );

                admin.setPhone(
                    "+255700000000"
                );

                admin.setRole(
                    adminRole
                );

                admin.setActive(
                    true
                );

                userRepository.save(admin);

                System.out.println(
                    "======================================="
                );

                System.out.println(
                    "DEFAULT ADMIN CREATED"
                );

                System.out.println(
                    "Username: admin"
                );

                System.out.println(
                    "Password: Admin@123"
                );

                System.out.println(
                    "Role: ADMIN"
                );

                System.out.println(
                    "======================================="
                );
            }
        };
    }
}