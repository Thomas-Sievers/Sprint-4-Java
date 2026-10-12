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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@Tag(name = "Transcript lines", description = "Lines spoken in a meeting, as transcribed by the AI")
@RequestMapping("/api/transcript-lines")
public class TranscriptLineController {

    private final TranscriptLineService service;

    public TranscriptLineController(TranscriptLineService service) {
        this.service = service;
    }

    @Operation(summary = "List all transcript lines")
    @GetMapping
    public List<TranscriptLine> findAll() {
        return service.findAll();
    }

    @Operation(summary = "Find a transcript line by id")
    @GetMapping("/{id}")
    public TranscriptLine findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @Operation(summary = "Create a transcript line", description = "The speaker must be linked to the meeting and spokenAt must be within the meeting time range")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TranscriptLine create(@RequestBody @Valid TranscriptLineRequest request) {
        return service.create(request);
    }

    @Operation(summary = "Update a transcript line", description = "The speaker must be linked to the meeting and spokenAt must be within the meeting time range")
    @PutMapping("/{id}")
    public TranscriptLine update(@PathVariable Long id, @RequestBody @Valid TranscriptLineRequest request) {
        return service.update(id, request);
    }

    @Operation(summary = "Delete a transcript line", description = "A transcript line that has alerts cannot be deleted")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
