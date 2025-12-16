/**
 * Mock helpers for candidate service tests
 *
 * This file provides reusable mock setup functions and configurations
 * to avoid duplication in service tests.
 */

import { Candidate } from '../../domain/models/Candidate';
import { Education } from '../../domain/models/Education';
import { WorkExperience } from '../../domain/models/WorkExperience';
import { Resume } from '../../domain/models/Resume';

/**
 * Creates and returns all mocks needed for candidate service tests
 * @returns Object containing all mock functions
 */
export const setupCandidateServiceMocks = () => {
    const mockCandidateSave = jest.fn().mockResolvedValue({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: null,
        address: null,
    });

    const mockEducationSave = jest.fn().mockResolvedValue({
        id: 1,
        candidateId: 1,
    });

    const mockWorkExperienceSave = jest.fn().mockResolvedValue({
        id: 1,
        candidateId: 1,
    });

    const mockResumeSave = jest.fn().mockResolvedValue({
        id: 1,
        candidateId: 1,
    });

    return {
        mockCandidateSave,
        mockEducationSave,
        mockWorkExperienceSave,
        mockResumeSave,
    };
};

/**
 * Sets up mock implementations for all domain models
 * @param mocks - Object containing mock functions from setupCandidateServiceMocks
 */
export const mockDomainModels = (mocks: ReturnType<typeof setupCandidateServiceMocks>) => {
    // Mock Candidate constructor and methods
    (Candidate as jest.MockedClass<typeof Candidate>).mockImplementation((data: any) => {
        return {
            id: data.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            address: data.address,
            education: [],
            workExperience: [],
            resumes: [],
            save: mocks.mockCandidateSave,
        } as any;
    });

    // Mock Education constructor and methods
    (Education as jest.MockedClass<typeof Education>).mockImplementation((data: any) => {
        return {
            id: data.id,
            institution: data.institution,
            title: data.title,
            startDate: data.startDate,
            endDate: data.endDate,
            candidateId: data.candidateId,
            save: mocks.mockEducationSave,
        } as any;
    });

    // Mock WorkExperience constructor and methods
    (WorkExperience as jest.MockedClass<typeof WorkExperience>).mockImplementation((data: any) => {
        return {
            id: data.id,
            company: data.company,
            position: data.position,
            description: data.description,
            startDate: data.startDate,
            endDate: data.endDate,
            candidateId: data.candidateId,
            save: mocks.mockWorkExperienceSave,
        } as any;
    });

    // Mock Resume constructor and methods
    (Resume as jest.MockedClass<typeof Resume>).mockImplementation((data: any) => {
        return {
            id: data.id,
            filePath: data.filePath,
            fileType: data.fileType,
            candidateId: data.candidateId,
            save: mocks.mockResumeSave,
        } as any;
    });
};
