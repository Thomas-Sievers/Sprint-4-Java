package br.com.fiap.nous_sight.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.fiap.nous_sight.entity.Department;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

    boolean existsByAcronymIgnoreCase(String acronym);

    boolean existsByAcronymIgnoreCaseAndIdNot(String acronym, Long id);
}
