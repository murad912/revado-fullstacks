package com.revado.repository;

import com.revado.model.PasswordResetToken;
import com.revado.model.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);

    @Transactional
    void deleteByUser(User user); // To clean up old tokens
}