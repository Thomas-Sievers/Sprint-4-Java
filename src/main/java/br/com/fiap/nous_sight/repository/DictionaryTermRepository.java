package br.com.fiap.nous_sight.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.fiap.nous_sight.entity.DictionaryTerm;

public interface DictionaryTermRepository extends JpaRepository<DictionaryTerm, Long> {

    boolean existsByKeywordIgnoreCase(String keyword);

    boolean existsByKeywordIgnoreCaseAndIdNot(String keyword, Long id);
}
