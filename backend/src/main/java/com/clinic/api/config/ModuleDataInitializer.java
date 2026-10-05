package com.clinic.api.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.clinic.api.entity.Module;
import com.clinic.api.repository.ModuleRepository;

@Configuration
public class ModuleDataInitializer {

    @Bean
    CommandLineRunner initializeModules(ModuleRepository moduleRepository) {

        return args -> {

            List<Module> modules = List.of(

                new Module(
                    "DASHBOARD",
                    "Dashboard",
                    "/"
                ),

                new Module(
                    "RECEPTION",
                    "Reception",
                    "/reception"
                ),

                new Module(
                    "NURSE",
                    "Nurse",
                    "/nurse"
                ),

                new Module(
                    "DOCTOR",
                    "Doctor",
                    "/doctor"
                ),

                new Module(
                    "LABORATORY",
                    "Laboratory",
                    "/laboratory"
                ),

                new Module(
                    "PHARMACY",
                    "Pharmacy",
                    "/pharmacy"
                ),

                new Module(
                    "BILLING",
                    "Billing",
                    "/billing"
                ),

                new Module(
                    "MATERNITY",
                    "Maternity",
                    "/maternity"
                ),

                new Module(
                    "USERS",
                    "Users",
                    "/users"
                )
            );

            for (Module module : modules) {

                if (!moduleRepository.existsByName(module.getName())) {
                    moduleRepository.save(module);

                    System.out.println(
                        "Created module: " + module.getName()
                    );
                }
            }
        };
    }
}
