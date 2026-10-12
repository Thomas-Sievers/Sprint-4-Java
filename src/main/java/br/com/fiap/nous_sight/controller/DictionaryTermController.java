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

import br.com.fiap.nous_sight.dto.DictionaryTermRequest;
import br.com.fiap.nous_sight.entity.DictionaryTerm;
import br.com.fiap.nous_sight.service.DictionaryTermService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@Tag(name = "Dictionary terms", description = "Keywords monitored in the meetings (competitors, own products, technology)")
@RequestMapping("/api/dictionary-terms")
public class DictionaryTermController {

    private final DictionaryTermService service;

    public DictionaryTermController(DictionaryTermService service) {
        this.service = service;
    }

    @Operation(summary = "List all dictionary terms")
    @GetMapping
    public List<DictionaryTerm> findAll() {
        return service.findAll();
    }

    @Operation(summary = "Find a dictionary term by id")
    @GetMapping("/{id}")
    public DictionaryTerm findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @Operation(summary = "Create a dictionary term", description = "The keyword must be unique (case-insensitive)")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DictionaryTerm create(@RequestBody @Valid DictionaryTermRequest request) {
        return service.create(request);
    }

    @Operation(summary = "Update a dictionary term", description = "The keyword must be unique (case-insensitive)")
    @PutMapping("/{id}")
    public DictionaryTerm update(@PathVariable Long id, @RequestBody @Valid DictionaryTermRequest request) {
        return service.update(id, request);
    }

    @Operation(summary = "Delete a dictionary term", description = "A term that has alerts cannot be deleted")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
