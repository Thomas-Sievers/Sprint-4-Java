package br.com.fiap.nous_sight.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.fiap.nous_sight.dto.DictionaryTermRequest;
import br.com.fiap.nous_sight.entity.DictionaryTerm;
import br.com.fiap.nous_sight.exception.BusinessException;
import br.com.fiap.nous_sight.exception.ResourceNotFoundException;
import br.com.fiap.nous_sight.repository.DictionaryTermRepository;
import br.com.fiap.nous_sight.repository.GeneratedAlertRepository;

@Service
public class DictionaryTermService {

    private final DictionaryTermRepository repository;
    private final GeneratedAlertRepository alertRepository;

    public DictionaryTermService(DictionaryTermRepository repository, GeneratedAlertRepository alertRepository) {
        this.repository = repository;
        this.alertRepository = alertRepository;
    }

    @Transactional(readOnly = true)
    public List<DictionaryTerm> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public DictionaryTerm findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dictionary term not found: " + id));
    }

    @Transactional
    public DictionaryTerm create(DictionaryTermRequest request) {
        if (repository.existsByKeywordIgnoreCase(request.keyword())) {
            throw duplicateKeyword(request.keyword());
        }
        DictionaryTerm term = new DictionaryTerm();
        fill(term, request);
        return repository.save(term);
    }

    @Transactional
    public DictionaryTerm update(Long id, DictionaryTermRequest request) {
        DictionaryTerm term = findById(id);
        if (repository.existsByKeywordIgnoreCaseAndIdNot(request.keyword(), id)) {
            throw duplicateKeyword(request.keyword());
        }
        fill(term, request);
        return repository.save(term);
    }

    @Transactional
    public void delete(Long id) {
        DictionaryTerm term = findById(id);
        validateHasNoAlerts(term);
        repository.delete(term);
    }

    private void validateHasNoAlerts(DictionaryTerm term) {
        if (alertRepository.existsByTerm_Id(term.getId())) {
            throw new BusinessException("Dictionary term " + term.getId() + " has alerts and cannot be deleted");
        }
    }

    private BusinessException duplicateKeyword(String keyword) {
        return new BusinessException("Keyword already in use: " + keyword);
    }

    private void fill(DictionaryTerm term, DictionaryTermRequest request) {
        term.setKeyword(request.keyword());
        term.setCategory(request.category());
    }
}
