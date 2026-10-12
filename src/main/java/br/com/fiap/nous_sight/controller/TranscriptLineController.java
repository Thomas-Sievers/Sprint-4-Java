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

import br.com.fiap.nous_sight.dto.TranscriptLineRequest;
import br.com.fiap.nous_sight.entity.TranscriptLine;
import br.com.fiap.nous_sight.service.TranscriptLineService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/transcript-lines")
public class TranscriptLineController {

    private final TranscriptLineService service;

    public TranscriptLineController(TranscriptLineService service) {
        this.service = service;
    }

    @GetMapping
    public List<TranscriptLine> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public TranscriptLine findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TranscriptLine create(@RequestBody @Valid TranscriptLineRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public TranscriptLine update(@PathVariable Long id, @RequestBody @Valid TranscriptLineRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
