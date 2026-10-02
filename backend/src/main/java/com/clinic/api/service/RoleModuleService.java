package com.clinic.api.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.clinic.api.entity.Module;
import com.clinic.api.entity.Role;
import com.clinic.api.entity.RoleModule;
import com.clinic.api.repository.ModuleRepository;
import com.clinic.api.repository.RoleModuleRepository;
import com.clinic.api.repository.RoleRepository;

@Service
public class RoleModuleService {

    private final RoleModuleRepository roleModuleRepository;
    private final RoleRepository roleRepository;
    private final ModuleRepository moduleRepository;

    public RoleModuleService(
            RoleModuleRepository roleModuleRepository,
            RoleRepository roleRepository,
            ModuleRepository moduleRepository) {

        this.roleModuleRepository = roleModuleRepository;
        this.roleRepository = roleRepository;
        this.moduleRepository = moduleRepository;
    }

    public List<RoleModule> getPermissionsByRole(Long roleId) {
        return roleModuleRepository.findByRoleId(roleId);
    }

    public RoleModule assignModuleToRole(
            Long roleId,
            Long moduleId,
            boolean allowed) {

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Role not found with id: " + roleId));

        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Module not found with id: " + moduleId));

        RoleModule roleModule =
                roleModuleRepository
                        .findByRoleIdAndModuleId(roleId, moduleId)
                        .orElseGet(RoleModule::new);

        roleModule.setRole(role);
        roleModule.setModule(module);
        roleModule.setAllowed(allowed);

        return roleModuleRepository.save(roleModule);
    }

    public void removeModuleFromRole(
            Long roleId,
            Long moduleId) {

        RoleModule roleModule =
                roleModuleRepository
                        .findByRoleIdAndModuleId(roleId, moduleId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Permission not found"));

        roleModuleRepository.delete(roleModule);
    }
}