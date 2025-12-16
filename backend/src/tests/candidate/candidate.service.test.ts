/**
 * Candidate Service Tests - Database Operations
 *
 * This file contains all database operation tests for the addCandidate service.
 * Tests are organized by operation type: successful operations, error handling,
 * and relationship management.
 */

import { addCandidate } from '../../application/services/candidateService';
import { Candidate } from '../../domain/models/Candidate';
import { Education } from '../../domain/models/Education';
import { WorkExperience } from '../../domain/models/WorkExperience';
import { Resume } from '../../domain/models/Resume';
import {
    validCandidateMinimal,
    validCandidateFull,
    validEducation,
    validWorkExperience,
    validCV,
} from '../fixtures/candidateFixtures';
import { setupCandidateServiceMocks, mockDomainModels } from '../helpers/candidateMocks';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
    const mockPrismaClient = {
        candidate: {
            create: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mockPrismaClient),
        Prisma: {
            PrismaClientInitializationError: class PrismaClientInitializationError extends Error {
                constructor(message: string) {
                    super(message);
                    this.name = 'PrismaClientInitializationError';
                }
            },
        },
    };
});

// Mock domain models to avoid real database calls
jest.mock('../../domain/models/Candidate');
jest.mock('../../domain/models/Education');
jest.mock('../../domain/models/WorkExperience');
jest.mock('../../domain/models/Resume');

describe('Candidate Service - Database Operations', () => {

    let mocks: ReturnType<typeof setupCandidateServiceMocks>;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Setup mock implementations
        mocks = setupCandidateServiceMocks();
        mockDomainModels(mocks);
    });

    // ========================================
    // GROUP 1: ADDING CANDIDATES SUCCESSFULLY
    // ========================================

    describe('Adding Candidates Successfully', () => {

        test('should successfully add candidate with only required fields', async () => {
            // Arrange
            const candidateData = validCandidateMinimal;

            // Act
            const result = await addCandidate(candidateData);

            // Assert
            expect(result).toBeDefined();
            expect(result.id).toBe(1);
            expect(result.email).toBe(candidateData.email);
            expect(mocks.mockCandidateSave).toHaveBeenCalledTimes(1);
            expect(mocks.mockEducationSave).not.toHaveBeenCalled();
            expect(mocks.mockWorkExperienceSave).not.toHaveBeenCalled();
            expect(mocks.mockResumeSave).not.toHaveBeenCalled();
        });

        test('should successfully add candidate with educations', async () => {
            // Arrange
            const candidateData = {
                ...validCandidateMinimal,
                educations: [validEducation],
            };

            // Act
            const result = await addCandidate(candidateData);

            // Assert
            expect(result).toBeDefined();
            expect(mocks.mockCandidateSave).toHaveBeenCalledTimes(1);
            expect(mocks.mockEducationSave).toHaveBeenCalledTimes(1);
            expect(Education).toHaveBeenCalledWith(validEducation);
        });

        test('should successfully add candidate with multiple educations', async () => {
            // Arrange
            const candidateData = {
                ...validCandidateMinimal,
                educations: [
                    validEducation,
                    { ...validEducation, institution: 'Stanford' },
                ],
            };

            // Act
            const result = await addCandidate(candidateData);

            // Assert
            expect(result).toBeDefined();
            expect(mocks.mockCandidateSave).toHaveBeenCalledTimes(1);
            expect(mocks.mockEducationSave).toHaveBeenCalledTimes(2);
            expect(Education).toHaveBeenCalledTimes(2);
        });

        test('should successfully add candidate with work experiences', async () => {
            // Arrange
            const candidateData = {
                ...validCandidateMinimal,
                workExperiences: [validWorkExperience],
            };

            // Act
            const result = await addCandidate(candidateData);

            // Assert
            expect(result).toBeDefined();
            expect(mocks.mockCandidateSave).toHaveBeenCalledTimes(1);
            expect(mocks.mockWorkExperienceSave).toHaveBeenCalledTimes(1);
            expect(WorkExperience).toHaveBeenCalledWith(validWorkExperience);
        });

        test('should successfully add candidate with multiple work experiences', async () => {
            // Arrange
            const candidateData = {
                ...validCandidateMinimal,
                workExperiences: [
                    validWorkExperience,
                    { ...validWorkExperience, company: 'Amazon' },
                ],
            };

            // Act
            const result = await addCandidate(candidateData);

            // Assert
            expect(result).toBeDefined();
            expect(mocks.mockCandidateSave).toHaveBeenCalledTimes(1);
            expect(mocks.mockWorkExperienceSave).toHaveBeenCalledTimes(2);
            expect(WorkExperience).toHaveBeenCalledTimes(2);
        });

        test('should successfully add candidate with CV', async () => {
            // Arrange
            const candidateData = {
                ...validCandidateMinimal,
                cv: validCV,
            };

            // Act
            const result = await addCandidate(candidateData);

            // Assert
            expect(result).toBeDefined();
            expect(mocks.mockCandidateSave).toHaveBeenCalledTimes(1);
            expect(mocks.mockResumeSave).toHaveBeenCalledTimes(1);
            expect(Resume).toHaveBeenCalledWith(validCV);
        });

        test('should successfully add candidate with complete data', async () => {
            // Arrange
            const candidateData = validCandidateFull;

            // Act
            const result = await addCandidate(candidateData);

            // Assert
            expect(result).toBeDefined();
            expect(result.id).toBe(1);
            expect(mocks.mockCandidateSave).toHaveBeenCalledTimes(1);
            expect(mocks.mockEducationSave).toHaveBeenCalledTimes(1);
            expect(mocks.mockWorkExperienceSave).toHaveBeenCalledTimes(1);
            expect(mocks.mockResumeSave).toHaveBeenCalledTimes(1);
        });

        test('should not save CV when cv is empty object', async () => {
            // Arrange
            const candidateData = {
                ...validCandidateMinimal,
                cv: {},
            };

            // Act
            const result = await addCandidate(candidateData);

            // Assert
            expect(result).toBeDefined();
            expect(mocks.mockResumeSave).not.toHaveBeenCalled();
        });

        test('should set candidateId correctly for all related entities', async () => {
            // Arrange
            const candidateData = {
                ...validCandidateMinimal,
                educations: [validEducation],
                workExperiences: [validWorkExperience],
                cv: validCV,
            };

            // Act
            await addCandidate(candidateData);

            // Assert
            // Verify that candidateId was set on each related entity before saving
            const educationInstance = (Education as jest.MockedClass<typeof Education>).mock.results[0].value;
            const workExperienceInstance = (WorkExperience as jest.MockedClass<typeof WorkExperience>).mock.results[0].value;
            const resumeInstance = (Resume as jest.MockedClass<typeof Resume>).mock.results[0].value;

            expect(educationInstance.candidateId).toBe(1);
            expect(workExperienceInstance.candidateId).toBe(1);
            expect(resumeInstance.candidateId).toBe(1);
        });
    });

    // ========================================
    // GROUP 2: ERROR HANDLING
    // ========================================

    describe('Error Handling', () => {

        // Database Constraint Violations
        describe('Database constraint violations', () => {

            test('should throw specific error when email already exists (P2002)', async () => {
                // Arrange
                const candidateData = validCandidateMinimal;
                const duplicateEmailError = {
                    code: 'P2002',
                    meta: { target: ['email'] },
                };
                mocks.mockCandidateSave.mockRejectedValue(duplicateEmailError);

                // Act & Assert
                await expect(addCandidate(candidateData)).rejects.toThrow(
                    'The email already exists in the database'
                );
            });

            test('should propagate database connection errors', async () => {
                // Arrange
                const candidateData = validCandidateMinimal;
                const connectionError = new Error('Database connection failed');
                mocks.mockCandidateSave.mockRejectedValue(connectionError);

                // Act & Assert
                await expect(addCandidate(candidateData)).rejects.toThrow(
                    'Database connection failed'
                );
            });

            test('should handle errors during education save', async () => {
                // Arrange
                const candidateData = {
                    ...validCandidateMinimal,
                    educations: [validEducation],
                };
                const saveError = new Error('Failed to save education');
                mocks.mockEducationSave.mockRejectedValue(saveError);

                // Act & Assert
                await expect(addCandidate(candidateData)).rejects.toThrow(
                    'Failed to save education'
                );
            });

            test('should handle errors during work experience save', async () => {
                // Arrange
                const candidateData = {
                    ...validCandidateMinimal,
                    workExperiences: [validWorkExperience],
                };
                const saveError = new Error('Failed to save work experience');
                mocks.mockWorkExperienceSave.mockRejectedValue(saveError);

                // Act & Assert
                await expect(addCandidate(candidateData)).rejects.toThrow(
                    'Failed to save work experience'
                );
            });

            test('should handle errors during resume save', async () => {
                // Arrange
                const candidateData = {
                    ...validCandidateMinimal,
                    cv: validCV,
                };
                const saveError = new Error('Failed to save resume');
                mocks.mockResumeSave.mockRejectedValue(saveError);

                // Act & Assert
                await expect(addCandidate(candidateData)).rejects.toThrow(
                    'Failed to save resume'
                );
            });
        });

        // Validation Errors
        describe('Validation errors', () => {

            test('should propagate validation errors from validator', async () => {
                // Arrange
                const invalidCandidate = {
                    firstName: 'J', // Too short
                    lastName: 'Doe',
                    email: 'test@example.com',
                };

                // Act & Assert
                await expect(addCandidate(invalidCandidate)).rejects.toThrow();
            });
        });
    });

    // ========================================
    // GROUP 3: RELATIONSHIP MANAGEMENT
    // ========================================

    describe('Relationship Management', () => {

        test('should process educations in order', async () => {
            // Arrange
            const education1 = { ...validEducation, institution: 'MIT' };
            const education2 = { ...validEducation, institution: 'Stanford' };
            const education3 = { ...validEducation, institution: 'Harvard' };

            const candidateData = {
                ...validCandidateMinimal,
                educations: [education1, education2, education3],
            };

            // Act
            await addCandidate(candidateData);

            // Assert
            expect(Education).toHaveBeenNthCalledWith(1, education1);
            expect(Education).toHaveBeenNthCalledWith(2, education2);
            expect(Education).toHaveBeenNthCalledWith(3, education3);
            expect(mocks.mockEducationSave).toHaveBeenCalledTimes(3);
        });

        test('should process work experiences in order', async () => {
            // Arrange
            const exp1 = { ...validWorkExperience, company: 'Google' };
            const exp2 = { ...validWorkExperience, company: 'Microsoft' };
            const exp3 = { ...validWorkExperience, company: 'Amazon' };

            const candidateData = {
                ...validCandidateMinimal,
                workExperiences: [exp1, exp2, exp3],
            };

            // Act
            await addCandidate(candidateData);

            // Assert
            expect(WorkExperience).toHaveBeenNthCalledWith(1, exp1);
            expect(WorkExperience).toHaveBeenNthCalledWith(2, exp2);
            expect(WorkExperience).toHaveBeenNthCalledWith(3, exp3);
            expect(mocks.mockWorkExperienceSave).toHaveBeenCalledTimes(3);
        });

        test('should save candidate before saving related entities', async () => {
            // Arrange
            const candidateData = {
                ...validCandidateMinimal,
                educations: [validEducation],
            };

            const saveOrder: string[] = [];

            mocks.mockCandidateSave.mockImplementation(async () => {
                saveOrder.push('candidate');
                return { id: 1, email: 'test@example.com' };
            });

            mocks.mockEducationSave.mockImplementation(async () => {
                saveOrder.push('education');
                return { id: 1, candidateId: 1 };
            });

            // Act
            await addCandidate(candidateData);

            // Assert
            expect(saveOrder).toEqual(['candidate', 'education']);
        });

        test('should handle empty arrays for educations and experiences', async () => {
            // Arrange
            const candidateData = {
                ...validCandidateMinimal,
                educations: [],
                workExperiences: [],
            };

            // Act
            const result = await addCandidate(candidateData);

            // Assert
            expect(result).toBeDefined();
            expect(mocks.mockEducationSave).not.toHaveBeenCalled();
            expect(mocks.mockWorkExperienceSave).not.toHaveBeenCalled();
        });

        test('should return saved candidate with correct structure', async () => {
            // Arrange
            const candidateData = validCandidateMinimal;
            const expectedCandidate = {
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: null,
                address: null,
            };
            mocks.mockCandidateSave.mockResolvedValue(expectedCandidate);

            // Act
            const result = await addCandidate(candidateData);

            // Assert
            expect(result).toEqual(expectedCandidate);
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('email');
        });
    });
});
