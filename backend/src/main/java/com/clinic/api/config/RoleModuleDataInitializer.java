package com.clinic.api.config;

import java.util.Map;
import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.clinic.api.entity.Module;
import com.clinic.api.entity.Role;
import com.clinic.api.entity.RoleModule;
import com.clinic.api.repository.ModuleRepository;
import com.clinic.api.repository.RoleModuleRepository;
import com.clinic.api.repository.RoleRepository;

@Configuration
public class RoleModuleDataInitializer {

    @Bean
    CommandLineRunner initializeRoleModules(
            RoleRepository roleRepository,
            ModuleRepository moduleRepository,
            RoleModuleRepository roleModuleRepository) {

        return args -> {

            Map<String, Set<String>> permissions = Map.of(

                "ADMIN", Set.of(
                    "DASHBOARD",
                    "RECEPTION",
                    "NURSE",
                    "DOCTOR",
                    "LABORATORY",
                    "PHARMACY",
                    "BILLING",
                    "MATERNITY",
                    "USERS"
                ),

                "RECEPTION", Set.of(
                    "DASHBOARD",
                    "RECEPTION"
                ),

                "NURSE", Set.of(
                    "DASHBOARD",
                    "NURSE",
                    "MATERNITY"
                ),

                "DOCTOR", Set.of(
                    "DASHBOARD",
                    "DOCTOR",
                    "LABORATORY"
                ),

                "LABORATORY", Set.of(
                    "DASHBOARD",
                    "LABORATORY"
                ),

                "PHARMACIST", Set.of(
                    "DASHBOARD",
                    "PHARMACY"
                ),

                "CASHIER", Set.of(
                    "DASHBOARD",
                    "BILLING"
                )
            );

            permissions.forEach((roleName, moduleNames) -> {

                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Role not found: " + roleName
                                ));

                moduleNames.forEach(moduleName -> {

                    Module module = moduleRepository.findByName(moduleName)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Module not found: " + moduleName
                                    ));

                    if (!roleModuleRepository
                            .existsByRoleIdAndModuleId(
                                    role.getId(),
                                    module.getId())) {

                        RoleModule roleModule =
                                new RoleModule(
                                        role,
                                        module,
                                        true
                                );

                        roleModuleRepository.save(roleModule);

                        System.out.println(
                            "Granted " + moduleName +
                            " permission to " + roleName
                        );
                    }
                });
            });
        };
    }
}