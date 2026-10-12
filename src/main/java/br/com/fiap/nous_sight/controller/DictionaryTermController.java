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
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/dictionary-terms")
public class DictionaryTermController {

    private final DictionaryTermService service;

    public DictionaryTermController(DictionaryTermService service) {
        this.service = service;
    }

    @GetMapping
    public List<DictionaryTerm> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public DictionaryTerm findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DictionaryTerm create(@RequestBody @Valid DictionaryTermRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public DictionaryTerm update(@PathVariable Long id, @RequestBody @Valid DictionaryTermRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
