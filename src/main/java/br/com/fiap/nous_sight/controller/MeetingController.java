package br.com.fiap.nous_sight.controller;

import java.util.List;
import java.util.Map;

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

import br.com.fiap.nous_sight.dto.MeetingParticipantRequest;
import br.com.fiap.nous_sight.dto.MeetingRequest;
import br.com.fiap.nous_sight.dto.MeetingSummaryDTO;
import br.com.fiap.nous_sight.dto.TranscriptAnalysisResult;
import br.com.fiap.nous_sight.dto.TranscriptRequest;
import br.com.fiap.nous_sight.entity.GeneratedAlert;
import br.com.fiap.nous_sight.entity.Meeting;
import br.com.fiap.nous_sight.entity.MeetingParticipant;
import br.com.fiap.nous_sight.entity.TranscriptLine;
import br.com.fiap.nous_sight.service.AlertService;
import br.com.fiap.nous_sight.service.ClientHistoryService;
import br.com.fiap.nous_sight.service.MeetingParticipantService;
import br.com.fiap.nous_sight.service.MeetingService;
import br.com.fiap.nous_sight.service.TranscriptAnalysisService;
import br.com.fiap.nous_sight.service.TranscriptLineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@Tag(name = "Meetings", description = "Monitored meetings, their participants, transcript analysis, summary and churn risk")
@RequestMapping("/api/meetings")
public class MeetingController {

    private final MeetingService service;
    private final MeetingParticipantService meetingParticipantService;
    private final TranscriptLineService transcriptLineService;
    private final TranscriptAnalysisService transcriptAnalysisService;
    private final AlertService alertService;
    private final ClientHistoryService clientHistoryService;

    public MeetingController(MeetingService service,
                             MeetingParticipantService meetingParticipantService,
                             TranscriptLineService transcriptLineService,
                             TranscriptAnalysisService transcriptAnalysisService,
                             AlertService alertService,
                             ClientHistoryService clientHistoryService) {
        this.service = service;
        this.meetingParticipantService = meetingParticipantService;
        this.transcriptLineService = transcriptLineService;
        this.transcriptAnalysisService = transcriptAnalysisService;
        this.alertService = alertService;
        this.clientHistoryService = clientHistoryService;
    }

    @Operation(summary = "List all meetings")
    @GetMapping
    public List<Meeting> findAll() {
        return service.findAll();
    }

    @Operation(summary = "Find a meeting by id")
    @GetMapping("/{id}")
    public Meeting findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @Operation(summary = "Create a meeting", description = "endDateTime, when present, must not be before startDateTime")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Meeting create(@RequestBody @Valid MeetingRequest request) {
        return service.create(request);
    }

    @Operation(summary = "Update a meeting", description = "endDateTime, when present, must not be before startDateTime")
    @PutMapping("/{id}")
    public Meeting update(@PathVariable Long id, @RequestBody @Valid MeetingRequest request) {
        return service.update(id, request);
    }

    @Operation(summary = "Delete a meeting", description = "A meeting that has transcript lines or participants cannot be deleted")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @Operation(summary = "List the participants of a meeting")
    @GetMapping("/{id}/participants")
    public List<MeetingParticipant> findParticipants(@PathVariable Long id) {
        return meetingParticipantService.findByMeeting(id);
    }

    @Operation(summary = "Link a participant to a meeting", description = "No duplicate links and at most one ORGANIZER per meeting")
    @PostMapping("/{id}/participants")
    @ResponseStatus(HttpStatus.CREATED)
    public MeetingParticipant addParticipant(@PathVariable Long id,
                                             @RequestBody @Valid MeetingParticipantRequest request) {
        return meetingParticipantService.add(id, request);
    }

    @Operation(summary = "Unlink a participant from a meeting")
    @DeleteMapping("/{id}/participants/{participantId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeParticipant(@PathVariable Long id, @PathVariable Long participantId) {
        meetingParticipantService.remove(id, participantId);
    }

    @Operation(summary = "List the transcript lines of a meeting")
    @GetMapping("/{id}/transcript-lines")
    public List<TranscriptLine> findTranscriptLines(@PathVariable Long id) {
        return transcriptLineService.findByMeeting(id);
    }

    @Operation(summary = "Upload and analyze a meeting transcript", description = "Saves every line (all or nothing) and creates one alert per dictionary term found as a whole word, ignoring case and accents. Score 95, or 70 for keywords of up to 3 characters (ambiguous acronyms), which then need human validation")
    @PostMapping("/{id}/transcript")
    @ResponseStatus(HttpStatus.CREATED)
    public TranscriptAnalysisResult analyzeTranscript(@PathVariable Long id,
                                                      @RequestBody @Valid TranscriptRequest request) {
        return transcriptAnalysisService.analyze(id, request);
    }

    @Operation(summary = "List the alerts of a meeting")
    @GetMapping("/{id}/alerts")
    public List<GeneratedAlert> findAlerts(@PathVariable Long id) {
        return alertService.findByMeeting(id);
    }

    @Operation(summary = "Meeting summary", description = "Total transcript lines, total alerts, average confidence score and detected terms by category")
    @GetMapping("/{id}/summary")
    public MeetingSummaryDTO summary(@PathVariable Long id) {
        return clientHistoryService.generateMeetingSummary(id);
    }

    @Operation(summary = "Churn risk of a meeting", description = "Counts COMPETITOR alerts in the meeting: 0-1 Low, 2-3 Medium, 4+ High")
    @GetMapping("/{id}/churn-risk")
    public Map<String, Object> churnRisk(@PathVariable Long id) {
        return Map.of("meetingId", id, "churnRisk", clientHistoryService.calculateChurnRisk(id));
    }
}
