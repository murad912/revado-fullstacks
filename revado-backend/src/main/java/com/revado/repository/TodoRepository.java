package com.revado.repository;

import com.revado.model.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {
    // This gives you findAll(), save(), deleteById(), etc. automatically
}
