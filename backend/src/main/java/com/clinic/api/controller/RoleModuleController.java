package com.clinic.api.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.clinic.api.entity.RoleModule;
import com.clinic.api.service.RoleModuleService;

@RestController
@RequestMapping("/api/role-modules")
public class RoleModuleController {

    private final RoleModuleService roleModuleService;

    public RoleModuleController(RoleModuleService roleModuleService) {
        this.roleModuleService = roleModuleService;
    }

    @GetMapping("/role/{roleId}")
    public ResponseEntity<List<RoleModule>> getPermissionsByRole(
            @PathVariable Long roleId) {

        return ResponseEntity.ok(
                roleModuleService.getPermissionsByRole(roleId)
        );
    }

    @PostMapping
    public ResponseEntity<RoleModule> assignModuleToRole(
            @RequestParam Long roleId,
            @RequestParam Long moduleId,
            @RequestParam boolean allowed) {

        return ResponseEntity.ok(
                roleModuleService.assignModuleToRole(
                        roleId,
                        moduleId,
                        allowed
                )
        );
    }

    @DeleteMapping
    public ResponseEntity<Void> removeModuleFromRole(
            @RequestParam Long roleId,
            @RequestParam Long moduleId) {

        roleModuleService.removeModuleFromRole(
                roleId,
                moduleId
        );

        return ResponseEntity.noContent().build();
    }
}