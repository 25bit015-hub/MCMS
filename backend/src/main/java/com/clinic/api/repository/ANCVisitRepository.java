package com.clinic.api.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinic.api.entity.ANCVisit;

public interface ANCVisitRepository extends JpaRepository<ANCVisit, Long> {

    /*
     * Visits zote za pregnancy fulani,
     * kuanzia mpya kwenda ya zamani.
     */
    List<ANCVisit> findByPregnancyIdOrderByVisitDateDesc(Long pregnancyId);

    /*
     * Visits zote zilizo ACTIVE za pregnancy fulani.
     */
    List<ANCVisit> findByPregnancyIdAndRecordStatusOrderByVisitDateDesc(
            Long pregnancyId,
            String recordStatus
    );

    /*
     * Visits za tarehe fulani.
     */
    List<ANCVisit> findByVisitDate(LocalDate visitDate);

    /*
     * Visits ndani ya kipindi fulani.
     * Hii itatusaidia baadaye kwenye daily/monthly
     * maternity reports.
     */
    List<ANCVisit> findByVisitDateBetweenOrderByVisitDateDesc(
            LocalDate startDate,
            LocalDate endDate
    );

    /*
     * Idadi ya visits za pregnancy fulani.
     */
    long countByPregnancyId(Long pregnancyId);

    /*
     * Idadi ya ACTIVE visits za pregnancy fulani.
     */
    long countByPregnancyIdAndRecordStatus(
            Long pregnancyId,
            String recordStatus
    );
    boolean existsByPregnancyIdAndVisitDateAndVisitTypeAndRecordStatus(
        Long pregnancyId,
        LocalDate visitDate,
        String visitType,
        String recordStatus
);


boolean existsByPregnancyIdAndVisitDateAndVisitTypeAndRecordStatusAndIdNot(
        Long pregnancyId,
        LocalDate visitDate,
        String visitType,
        String recordStatus,
        Long id
);
}