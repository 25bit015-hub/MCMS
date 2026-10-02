package com.clinic.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinic.api.entity.RoleModule;

public interface RoleModuleRepository extends JpaRepository<RoleModule, Long> {

    List<RoleModule> findByRoleId(Long roleId);

    List<RoleModule> findByModuleId(Long moduleId);

    Optional<RoleModule> findByRoleIdAndModuleId(Long roleId, Long moduleId);

    boolean existsByRoleIdAndModuleId(Long roleId, Long moduleId);
}