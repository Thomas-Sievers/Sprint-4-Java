package br.com.fiap.nous_sight.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.fiap.nous_sight.dto.TranscriptLineRequest;
import br.com.fiap.nous_sight.entity.Meeting;
import br.com.fiap.nous_sight.entity.Participant;
import br.com.fiap.nous_sight.entity.TranscriptLine;
import br.com.fiap.nous_sight.exception.BusinessException;
import br.com.fiap.nous_sight.exception.ResourceNotFoundException;
import br.com.fiap.nous_sight.repository.GeneratedAlertRepository;
import br.com.fiap.nous_sight.repository.TranscriptLineRepository;

@Service
public class TranscriptLineService {

    private final TranscriptLineRepository repository;
    private final MeetingService meetingService;
    private final ParticipantService participantService;
    private final MeetingParticipantService meetingParticipantService;
    private final GeneratedAlertRepository alertRepository;

    public TranscriptLineService(TranscriptLineRepository repository,
                                 MeetingService meetingService,
                                 ParticipantService participantService,
                                 MeetingParticipantService meetingParticipantService,
                                 GeneratedAlertRepository alertRepository) {
        this.repository = repository;
        this.meetingService = meetingService;
        this.participantService = participantService;
        this.meetingParticipantService = meetingParticipantService;
        this.alertRepository = alertRepository;
    }

    @Transactional(readOnly = true)
    public List<TranscriptLine> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public TranscriptLine findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transcript line not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<TranscriptLine> findByMeeting(Long meetingId) {
        meetingService.findById(meetingId);
        return repository.findByMeeting_IdOrderBySpokenAt(meetingId);
    }

    @Transactional
    public TranscriptLine create(TranscriptLineRequest request) {
        TranscriptLine line = new TranscriptLine();
        fill(line, request);
        return repository.save(line);
    }

    @Transactional
    public TranscriptLine update(Long id, TranscriptLineRequest request) {
        TranscriptLine line = findById(id);
        fill(line, request);
        return repository.save(line);
    }

    @Transactional
    public void delete(Long id) {
        TranscriptLine line = findById(id);
        validateHasNoAlerts(line);
        repository.delete(line);
    }

    private void validateSpeakerIsInMeeting(Meeting meeting, Participant participant) {
        if (!meetingParticipantService.isLinked(meeting.getId(), participant.getId())) {
            throw new BusinessException(
                    "Participant " + participant.getId() + " is not linked to meeting " + meeting.getId());
        }
    }

    private void validateSpokenAtWithinMeeting(Meeting meeting, TranscriptLineRequest request) {
        boolean beforeStart = request.spokenAt().isBefore(meeting.getStartDateTime());
        boolean afterEnd = meeting.getEndDateTime() != null && request.spokenAt().isAfter(meeting.getEndDateTime());
        if (beforeStart || afterEnd) {
            throw new BusinessException("spokenAt " + request.spokenAt()
                    + " is outside the time range of meeting " + meeting.getId());
        }
    }

    private void validateHasNoAlerts(TranscriptLine line) {
        if (alertRepository.existsByTranscriptLine_Id(line.getId())) {
            throw new BusinessException("Transcript line " + line.getId() + " has alerts and cannot be deleted");
        }
    }

    private void fill(TranscriptLine line, TranscriptLineRequest request) {
        Meeting meeting = meetingService.findById(request.meetingId());
        Participant participant = participantService.findById(request.participantId());
        validateSpeakerIsInMeeting(meeting, participant);
        validateSpokenAtWithinMeeting(meeting, request);

        line.setMeeting(meeting);
        line.setParticipant(participant);
        line.setSpokenAt(request.spokenAt());
        line.setText(request.text());
    }
}
