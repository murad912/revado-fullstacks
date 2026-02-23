package com.revado.model;


import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "users") // 'user' is often a reserved word in SQL, so 'users' is safer
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    private String email;

    // A User can have many Todos
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Todo> todos;
}