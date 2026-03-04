package com.revado.Controller;



import com.revado.model.PasswordResetToken;
import com.revado.model.User;
import com.revado.repository.PasswordResetTokenRepository;
import com.revado.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost"})
public class PasswordResetController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private PasswordEncoder passwordEncoder; // Added this injection

    @PostMapping("/forgot-password")
    public ResponseEntity<?> processForgotPassword(@RequestBody java.util.Map<String, String> body) {
        String email = body.get("email");

        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Email is required"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            tokenRepository.deleteByUser(user);
            String token = UUID.randomUUID().toString();

            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setToken(token);
            resetToken.setUser(user);
            resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(15));
            tokenRepository.save(resetToken);

            sendResetEmail(user.getEmail(), token);
        }


        return ResponseEntity.ok().body(java.util.Map.of("message", "If that email exists, a link has been sent."));
    }


    private void sendResetEmail(String email, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Password Reset Request - RevaDo");
        // Ensure this port matches your Angular frontend port (4200 for local, 80 for Docker)
//        message.setText("Click the link to reset your password: " +
//                "http://localhost:4200/reset-password?token=" + token);
        message.setText("Click the link to reset your password: " +
                "http://localhost/reset-password?token=" + token);
        mailSender.send(message);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> handlePasswordReset(@RequestParam("token") String token,
                                                 @RequestParam("password") String newPassword) {

        // Find token in SQLite
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(token);

        if (tokenOpt.isEmpty() || tokenOpt.get().isExpired()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(java.util.Map.of("message", "Invalid or expired token."));        }

        PasswordResetToken resetToken = tokenOpt.get();
        User user = resetToken.getUser();

        // 4. Update and Encrypt the User's password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // 5. Delete the token (Security best practice)
        tokenRepository.delete(resetToken);

        return ResponseEntity.ok().body(java.util.Map.of("message", "Password updated successfully."));
    }
}


