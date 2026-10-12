package br.com.fiap.nous_sight.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.fiap.nous_sight.domain.ParticipationType;
import br.com.fiap.nous_sight.entity.MeetingParticipant;
import br.com.fiap.nous_sight.entity.MeetingParticipantId;

public interface MeetingParticipantRepository extends JpaRepository<MeetingParticipant, MeetingParticipantId> {

    List<MeetingParticipant> findByMeeting_Id(Long meetingId);

    boolean existsByMeeting_IdAndParticipationType(Long meetingId, ParticipationType participationType);

    boolean existsByMeeting_Id(Long meetingId);

    boolean existsByParticipant_Id(Long participantId);
}
