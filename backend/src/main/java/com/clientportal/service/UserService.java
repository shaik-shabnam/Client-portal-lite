package com.clientportal.service;

import com.clientportal.dto.UserDto;
import com.clientportal.entity.User;
import com.clientportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<UserDto> getAllClients() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.CLIENT)
                .map(UserDto::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllAdmins() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.ADMIN)
                .map(UserDto::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAll() {
        return userRepository.findAll().stream()
                .map(UserDto::from)
                .collect(Collectors.toList());
    }
}
