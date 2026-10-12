package br.com.fiap.nous_sight.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.fiap.nous_sight.entity.TranscriptLine;

public interface TranscriptLineRepository extends JpaRepository<TranscriptLine, Long> {

    List<TranscriptLine> findByMeeting_IdOrderBySpokenAt(Long meetingId);

    boolean existsByMeeting_Id(Long meetingId);

    boolean existsByParticipant_Id(Long participantId);
}
