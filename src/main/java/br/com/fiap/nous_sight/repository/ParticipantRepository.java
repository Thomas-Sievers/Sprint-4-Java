package br.com.fiap.nous_sight.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.fiap.nous_sight.entity.Participant;

public interface ParticipantRepository extends JpaRepository<Participant, Long> {

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    boolean existsByDepartment_Id(Long departmentId);
}
