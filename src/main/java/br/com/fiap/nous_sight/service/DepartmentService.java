package br.com.fiap.nous_sight.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.fiap.nous_sight.dto.DepartmentRequest;
import br.com.fiap.nous_sight.entity.Department;
import br.com.fiap.nous_sight.exception.BusinessException;
import br.com.fiap.nous_sight.exception.ResourceNotFoundException;
import br.com.fiap.nous_sight.repository.DepartmentRepository;
import br.com.fiap.nous_sight.repository.ParticipantRepository;

@Service
public class DepartmentService {

    private final DepartmentRepository repository;
    private final ParticipantRepository participantRepository;

    public DepartmentService(DepartmentRepository repository, ParticipantRepository participantRepository) {
        this.repository = repository;
        this.participantRepository = participantRepository;
    }

    @Transactional(readOnly = true)
    public List<Department> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Department findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));
    }

    @Transactional
    public Department create(DepartmentRequest request) {
        if (repository.existsByAcronymIgnoreCase(request.acronym())) {
            throw duplicateAcronym(request.acronym());
        }
        Department department = new Department();
        fill(department, request);
        return repository.save(department);
    }

    @Transactional
    public Department update(Long id, DepartmentRequest request) {
        Department department = findById(id);
        if (repository.existsByAcronymIgnoreCaseAndIdNot(request.acronym(), id)) {
            throw duplicateAcronym(request.acronym());
        }
        fill(department, request);
        return repository.save(department);
    }

    @Transactional
    public void delete(Long id) {
        Department department = findById(id);
        validateHasNoParticipants(department);
        repository.delete(department);
    }

    private void validateHasNoParticipants(Department department) {
        if (participantRepository.existsByDepartment_Id(department.getId())) {
            throw new BusinessException("Department " + department.getId() + " has participants and cannot be deleted");
        }
    }

    private BusinessException duplicateAcronym(String acronym) {
        return new BusinessException("Acronym already in use: " + acronym);
    }

    private void fill(Department department, DepartmentRequest request) {
        department.setDepartmentName(request.departmentName());
        department.setAcronym(request.acronym());
    }
}
