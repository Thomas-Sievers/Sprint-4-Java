package br.com.fiap.nous_sight.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.fiap.nous_sight.dto.MeetingRequest;
import br.com.fiap.nous_sight.entity.Meeting;
import br.com.fiap.nous_sight.exception.BusinessException;
import br.com.fiap.nous_sight.exception.ResourceNotFoundException;
import br.com.fiap.nous_sight.repository.MeetingParticipantRepository;
import br.com.fiap.nous_sight.repository.MeetingRepository;
import br.com.fiap.nous_sight.repository.TranscriptLineRepository;

@Service
public class MeetingService {

    private final MeetingRepository repository;
    private final TranscriptLineRepository transcriptLineRepository;
    private final MeetingParticipantRepository meetingParticipantRepository;

    public MeetingService(MeetingRepository repository,
                          TranscriptLineRepository transcriptLineRepository,
                          MeetingParticipantRepository meetingParticipantRepository) {
        this.repository = repository;
        this.transcriptLineRepository = transcriptLineRepository;
        this.meetingParticipantRepository = meetingParticipantRepository;
    }

    @Transactional(readOnly = true)
    public List<Meeting> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Meeting findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting not found: " + id));
    }

    @Transactional
    public Meeting create(MeetingRequest request) {
        validateEndNotBeforeStart(request);
        Meeting meeting = new Meeting();
        fill(meeting, request);
        return repository.save(meeting);
    }

    @Transactional
    public Meeting update(Long id, MeetingRequest request) {
        Meeting meeting = findById(id);
        validateEndNotBeforeStart(request);
        fill(meeting, request);
        return repository.save(meeting);
    }

    @Transactional
    public void delete(Long id) {
        Meeting meeting = findById(id);
        validateHasNoTranscriptLines(meeting);
        validateHasNoParticipants(meeting);
        repository.delete(meeting);
    }

    // Same rule as the CK_REUNIAO_HORARIO check: end >= start
    private void validateEndNotBeforeStart(MeetingRequest request) {
        if (request.endDateTime() != null && request.endDateTime().isBefore(request.startDateTime())) {
            throw new BusinessException("endDateTime must not be before startDateTime");
        }
    }

    private void validateHasNoTranscriptLines(Meeting meeting) {
        if (transcriptLineRepository.existsByMeeting_Id(meeting.getId())) {
            throw new BusinessException("Meeting " + meeting.getId() + " has transcript lines and cannot be deleted");
        }
    }

    private void validateHasNoParticipants(Meeting meeting) {
        if (meetingParticipantRepository.existsByMeeting_Id(meeting.getId())) {
            throw new BusinessException("Meeting " + meeting.getId() + " has participants and cannot be deleted");
        }
    }

    private void fill(Meeting meeting, MeetingRequest request) {
        meeting.setTitle(request.title());
        meeting.setStartDateTime(request.startDateTime());
        meeting.setEndDateTime(request.endDateTime());
    }
}
