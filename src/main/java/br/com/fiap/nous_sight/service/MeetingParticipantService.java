package br.com.fiap.nous_sight.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.fiap.nous_sight.domain.ParticipationType;
import br.com.fiap.nous_sight.dto.MeetingParticipantRequest;
import br.com.fiap.nous_sight.entity.Meeting;
import br.com.fiap.nous_sight.entity.MeetingParticipant;
import br.com.fiap.nous_sight.entity.MeetingParticipantId;
import br.com.fiap.nous_sight.entity.Participant;
import br.com.fiap.nous_sight.exception.BusinessException;
import br.com.fiap.nous_sight.exception.ResourceNotFoundException;
import br.com.fiap.nous_sight.repository.MeetingParticipantRepository;

@Service
public class MeetingParticipantService {

    private final MeetingParticipantRepository repository;
    private final MeetingService meetingService;
    private final ParticipantService participantService;

    public MeetingParticipantService(MeetingParticipantRepository repository,
                                     MeetingService meetingService,
                                     ParticipantService participantService) {
        this.repository = repository;
        this.meetingService = meetingService;
        this.participantService = participantService;
    }

    @Transactional(readOnly = true)
    public List<MeetingParticipant> findByMeeting(Long meetingId) {
        meetingService.findById(meetingId);
        return repository.findByMeeting_Id(meetingId);
    }

    @Transactional
    public MeetingParticipant add(Long meetingId, MeetingParticipantRequest request) {
        Meeting meeting = meetingService.findById(meetingId);
        Participant participant = participantService.findById(request.participantId());
        MeetingParticipantId id = new MeetingParticipantId(meetingId, participant.getId());

        validateNotLinked(id);
        validateSingleOrganizer(meetingId, request.participationType());

        MeetingParticipant link = MeetingParticipant.builder()
                .id(id)
                .meeting(meeting)
                .participant(participant)
                .participationType(request.participationType())
                .build();
        return repository.save(link);
    }

    @Transactional
    public void remove(Long meetingId, Long participantId) {
        MeetingParticipantId id = new MeetingParticipantId(meetingId, participantId);
        MeetingParticipant link = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Participant " + participantId + " is not linked to meeting " + meetingId));
        repository.delete(link);
    }

    @Transactional(readOnly = true)
    public boolean isLinked(Long meetingId, Long participantId) {
        return repository.existsById(new MeetingParticipantId(meetingId, participantId));
    }

    private void validateNotLinked(MeetingParticipantId id) {
        if (repository.existsById(id)) {
            throw new BusinessException(
                    "Participant " + id.getParticipantId() + " is already linked to meeting " + id.getMeetingId());
        }
    }

    private void validateSingleOrganizer(Long meetingId, ParticipationType type) {
        if (type == ParticipationType.ORGANIZER
                && repository.existsByMeeting_IdAndParticipationType(meetingId, ParticipationType.ORGANIZER)) {
            throw new BusinessException("Meeting " + meetingId + " already has an organizer");
        }
    }
}
