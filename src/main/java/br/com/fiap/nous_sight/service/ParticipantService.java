package br.com.fiap.nous_sight.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.fiap.nous_sight.dto.ParticipantRequest;
import br.com.fiap.nous_sight.entity.Participant;
import br.com.fiap.nous_sight.exception.BusinessException;
import br.com.fiap.nous_sight.exception.ResourceNotFoundException;
import br.com.fiap.nous_sight.repository.MeetingParticipantRepository;
import br.com.fiap.nous_sight.repository.ParticipantRepository;
import br.com.fiap.nous_sight.repository.TranscriptLineRepository;

@Service
public class ParticipantService {

    private final ParticipantRepository repository;
    private final DepartmentService departmentService;
    private final TranscriptLineRepository transcriptLineRepository;
    private final MeetingParticipantRepository meetingParticipantRepository;

    public ParticipantService(ParticipantRepository repository,
                              DepartmentService departmentService,
                              TranscriptLineRepository transcriptLineRepository,
                              MeetingParticipantRepository meetingParticipantRepository) {
        this.repository = repository;
        this.departmentService = departmentService;
        this.transcriptLineRepository = transcriptLineRepository;
        this.meetingParticipantRepository = meetingParticipantRepository;
    }

    @Transactional(readOnly = true)
    public List<Participant> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Participant findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Participant not found: " + id));
    }

    @Transactional
    public Participant create(ParticipantRequest request) {
        if (repository.existsByEmailIgnoreCase(request.email())) {
            throw duplicateEmail(request.email());
        }
        Participant participant = new Participant();
        fill(participant, request);
        return repository.save(participant);
    }

    @Transactional
    public Participant update(Long id, ParticipantRequest request) {
        Participant participant = findById(id);
        if (repository.existsByEmailIgnoreCaseAndIdNot(request.email(), id)) {
            throw duplicateEmail(request.email());
        }
        fill(participant, request);
        return repository.save(participant);
    }

    @Transactional
    public void delete(Long id) {
        Participant participant = findById(id);
        validateHasNoTranscriptLines(participant);
        validateIsNotInAnyMeeting(participant);
        repository.delete(participant);
    }

    private void validateHasNoTranscriptLines(Participant participant) {
        if (transcriptLineRepository.existsByParticipant_Id(participant.getId())) {
            throw new BusinessException("Participant " + participant.getId() + " has transcript lines and cannot be deleted");
        }
    }

    private void validateIsNotInAnyMeeting(Participant participant) {
        if (meetingParticipantRepository.existsByParticipant_Id(participant.getId())) {
            throw new BusinessException("Participant " + participant.getId() + " is linked to meetings and cannot be deleted");
        }
    }

    private BusinessException duplicateEmail(String email) {
        return new BusinessException("Email already in use: " + email);
    }

    private void fill(Participant participant, ParticipantRequest request) {
        participant.setName(request.name());
        participant.setEmail(request.email());
        participant.setDepartment(departmentService.findById(request.departmentId()));
    }
}
