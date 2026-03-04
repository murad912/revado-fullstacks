package com.revado.Controller;


import com.revado.dto.AuthRequest;
import com.revado.dto.AuthResponse;
import com.revado.model.User;
import com.revado.repository.UserRepository;
import com.revado.config.JwtUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

//    @PostMapping("/signup")
//    public String register(@RequestBody User user) {
//        // Encode the password before saving!
//        user.setPassword(passwordEncoder.encode(user.getPassword()));
//        userRepository.save(user);
//        return "User registered successfully!";
//    }

    @PostMapping("/signup")
    public ResponseEntity<?> register(@RequestBody User user) {
        // Check if username exists to avoid the generic error
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        // Return a JSON object so Angular's HttpClient parses it correctly
        return ResponseEntity.ok().body(java.util.Map.of("message", "User registered successfully"));
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Compare the plain text password with the hashed password in DB
        if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            String token = jwtUtils.generateToken(user.getUsername());
            return new AuthResponse(token);
        } else {
            throw new RuntimeException("Invalid credentials");
        }
    }
}