package com.school.auth.application.mapper;

import com.school.auth.application.dto.UserResponse;
import com.school.auth.domain.model.Role;
import com.school.auth.domain.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "schoolId", source = "school.id")
    @Mapping(target = "schoolCode", source = "school.code")
    @Mapping(target = "roles", expression = "java(mapRoles(user.getRoles()))")
    @Mapping(target = "status", expression = "java(user.getStatus().name())")
    UserResponse toResponse(User user);

    default Set<String> mapRoles(Set<Role> roles) {
        return roles.stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toUnmodifiableSet());
    }
}

