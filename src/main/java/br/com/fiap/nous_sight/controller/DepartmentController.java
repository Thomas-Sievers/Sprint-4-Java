package br.com.fiap.nous_sight.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.com.fiap.nous_sight.dto.DepartmentRequest;
import br.com.fiap.nous_sight.entity.Department;
import br.com.fiap.nous_sight.service.DepartmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@Tag(name = "Departments", description = "Departments the participants belong to")
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentService service;

    public DepartmentController(DepartmentService service) {
        this.service = service;
    }

    @Operation(summary = "List all departments")
    @GetMapping
    public List<Department> findAll() {
        return service.findAll();
    }

    @Operation(summary = "Find a department by id")
    @GetMapping("/{id}")
    public Department findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @Operation(summary = "Create a department", description = "The acronym must be unique (case-insensitive)")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Department create(@RequestBody @Valid DepartmentRequest request) {
        return service.create(request);
    }

    @Operation(summary = "Update a department", description = "The acronym must be unique (case-insensitive)")
    @PutMapping("/{id}")
    public Department update(@PathVariable Long id, @RequestBody @Valid DepartmentRequest request) {
        return service.update(id, request);
    }

    @Operation(summary = "Delete a department", description = "A department that has participants cannot be deleted")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
