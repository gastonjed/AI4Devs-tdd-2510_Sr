/**
 * Candidate Validation Tests
 *
 * This file contains all validation tests for the validateCandidateData function.
 * Tests are organized by validation type: required fields, optional fields,
 * nested objects, and edge cases.
 */

import { validateCandidateData } from '../../application/validator';
import {
    validCandidateMinimal,
    validCandidateFull,
    validEducation,
    validWorkExperience,
    validCV,
} from '../fixtures/candidateFixtures';

describe('Candidate Validation', () => {

    // ========================================
    // GROUP 1: REQUIRED AND OPTIONAL FIELDS
    // ========================================

    describe('Required and Optional Fields', () => {

        // Happy Path - Valid Data
        describe('Valid data', () => {

            test('should pass validation with only required fields', () => {
                // Arrange & Act & Assert
                expect(() => validateCandidateData(validCandidateMinimal)).not.toThrow();
            });

            test('should pass validation with all required fields and optional phone', () => {
                // Arrange
                const candidateWithPhone = {
                    ...validCandidateMinimal,
                    phone: '612345678',
                };

                // Act & Assert
                expect(() => validateCandidateData(candidateWithPhone)).not.toThrow();
            });

            test('should pass validation with all required fields and optional address', () => {
                // Arrange
                const candidateWithAddress = {
                    ...validCandidateMinimal,
                    address: 'Calle Gran Vía 45, Barcelona',
                };

                // Act & Assert
                expect(() => validateCandidateData(candidateWithAddress)).not.toThrow();
            });

            test('should pass validation with educations array', () => {
                // Arrange
                const candidateWithEducation = {
                    ...validCandidateMinimal,
                    educations: [validEducation],
                };

                // Act & Assert
                expect(() => validateCandidateData(candidateWithEducation)).not.toThrow();
            });

            test('should pass validation with work experiences array', () => {
                // Arrange
                const candidateWithExperience = {
                    ...validCandidateMinimal,
                    workExperiences: [validWorkExperience],
                };

                // Act & Assert
                expect(() => validateCandidateData(candidateWithExperience)).not.toThrow();
            });

            test('should pass validation with CV object', () => {
                // Arrange
                const candidateWithCV = {
                    ...validCandidateMinimal,
                    cv: validCV,
                };

                // Act & Assert
                expect(() => validateCandidateData(candidateWithCV)).not.toThrow();
            });

            test('should pass validation with complete candidate data', () => {
                // Arrange & Act & Assert
                expect(() => validateCandidateData(validCandidateFull)).not.toThrow();
            });

            test('should pass validation with multiple educations and experiences', () => {
                // Arrange
                const candidateMultiple = {
                    ...validCandidateMinimal,
                    educations: [
                        validEducation,
                        { ...validEducation, institution: 'Harvard' },
                    ],
                    workExperiences: [
                        validWorkExperience,
                        { ...validWorkExperience, company: 'Microsoft' },
                    ],
                };

                // Act & Assert
                expect(() => validateCandidateData(candidateMultiple)).not.toThrow();
            });
        });

        // Required Field Errors
        describe('Required field errors', () => {

            test.each([
                ['firstName', { lastName: 'Doe', email: 'test@example.com' }],
                ['lastName', { firstName: 'John', email: 'test@example.com' }],
            ])('should throw error when %s is missing', (fieldName, candidateData) => {
                // Act & Assert
                expect(() => validateCandidateData(candidateData)).toThrow('Invalid name');
            });

            test('should throw error when email is missing', () => {
                // Arrange
                const candidate = { firstName: 'John', lastName: 'Doe' };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).toThrow('Invalid email');
            });

            test('should throw error when firstName is too short', () => {
                // Arrange
                const candidate = { ...validCandidateMinimal, firstName: 'J' };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).toThrow('Invalid name');
            });

            test('should throw error when firstName is too long', () => {
                // Arrange
                const candidate = {
                    ...validCandidateMinimal,
                    firstName: 'A'.repeat(101),
                };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).toThrow('Invalid name');
            });

            test('should throw error when firstName contains invalid characters', () => {
                // Arrange
                const candidate = { ...validCandidateMinimal, firstName: 'John123' };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).toThrow('Invalid name');
            });

            test('should throw error when lastName is too short', () => {
                // Arrange
                const candidate = { ...validCandidateMinimal, lastName: 'D' };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).toThrow('Invalid name');
            });

            test('should throw error when lastName is too long', () => {
                // Arrange
                const candidate = {
                    ...validCandidateMinimal,
                    lastName: 'D'.repeat(101),
                };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).toThrow('Invalid name');
            });

            test('should throw error when lastName contains invalid characters', () => {
                // Arrange
                const candidate = { ...validCandidateMinimal, lastName: 'Doe@123' };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).toThrow('Invalid name');
            });

            test.each([
                ['missing @', 'invalidemail.com'],
                ['missing domain', 'invalid@'],
                ['missing local part', '@example.com'],
                ['invalid format', 'not-an-email'],
                ['spaces in email', 'test @example.com'],
            ])('should throw error when email is invalid: %s', (description, email) => {
                // Arrange
                const candidate = { ...validCandidateMinimal, email };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).toThrow('Invalid email');
            });
        });

        // Optional Field Validation
        describe('Optional field validation', () => {

            test.each([
                ['does not start with 6, 7, or 9', '512345678'],
                ['has less than 9 digits', '61234567'],
                ['has more than 9 digits', '6123456789'],
                ['contains letters', '61234567a'],
                ['contains spaces', '612 345 678'],
            ])('should throw error when phone is invalid: %s', (description, phone) => {
                // Arrange
                const candidate = { ...validCandidateMinimal, phone };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).toThrow('Invalid phone');
            });

            test.each([
                ['612345678', 'starts with 6'],
                ['712345678', 'starts with 7'],
                ['912345678', 'starts with 9'],
            ])('should pass validation with valid Spanish phone: %s (%s)', (phone) => {
                // Arrange
                const candidate = { ...validCandidateMinimal, phone };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).not.toThrow();
            });

            test('should throw error when address exceeds max length', () => {
                // Arrange
                const candidate = {
                    ...validCandidateMinimal,
                    address: 'A'.repeat(101),
                };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).toThrow('Invalid address');
            });

            test('should pass validation with address at max length', () => {
                // Arrange
                const candidate = {
                    ...validCandidateMinimal,
                    address: 'A'.repeat(100),
                };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).not.toThrow();
            });

            test('should allow Spanish characters in names', () => {
                // Arrange
                const candidate = {
                    firstName: 'José María',
                    lastName: 'Núñez García',
                    email: 'jose@example.com',
                };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).not.toThrow();
            });
        });
    });

    // ========================================
    // GROUP 2: NESTED OBJECTS
    // ========================================

    describe('Nested Objects', () => {

        // Education Validation
        describe('Education validation', () => {

            test('should throw error when education institution is missing', () => {
                // Arrange
                const candidate = {
                    ...validCandidateMinimal,
                    educations: [{ ...validEducation, institution: undefined }],
                };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).toThrow('Invalid institution');
            });

            test('should throw error when education institution exceeds max length', () => {
                // Arrange
                const candidate = {
                    ...validCandidateMinimal,
                    educations: [{ ...validEducation, institution: 'A'.repeat(101) }],
                };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).toThrow('Invalid institution');
            });

            test('should throw error when education title is missing', () => {
                // Arrange
                const candidate = {
                    ...validCandidateMinimal,
                    educations: [{ ...validEducation, title: undefined }],
                };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).toThrow('Invalid title');
            });

            test('should throw error when education title exceeds max length', () => {
                // Arrange
                const candidate = {
                    ...validCandidateMinimal,
                    educations: [{ ...validEducation, title: 'A'.repeat(101) }],
                };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).toThrow('Invalid title');
            });

            test.each([
                ['invalid format', '01-09-2020'],
                ['missing dashes', '20200901'],
                ['wrong year format', '20-09-01'],
                ['letters in date', '2020-ab-01'],
            ])('should throw error when education startDate is invalid: %s', (description, startDate) => {
                // Arrange
                const candidate = {
                    ...validCandidateMinimal,
                    educations: [{ ...validEducation, startDate }],
                };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).toThrow('Invalid date');
            });

            test('should throw error when education endDate has invalid format', () => {
                // Arrange
                const candidate = {
                    ...validCandidateMinimal,
                    educations: [{ ...validEducation, endDate: '31-12-2022' }],
                };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).toThrow('Invalid end date');
            });

            test('should pass validation when education endDate is null/undefined', () => {
                // Arrange
                const candidate = {
                    ...validCandidateMinimal,
                    educations: [{ ...validEducation, endDate: undefined }],
                };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).not.toThrow();
            });
        });

        // Work Experience Validation
        describe('Work experience validation', () => {

            test('should throw error when work experience company is missing', () => {
                // Arrange
                const candidate = {
                    ...validCandidateMinimal,
                    workExperiences: [{ ...validWorkExperience, company: undefined }],
                };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).toThrow('Invalid company');
            });

            test('should throw error when work experience company exceeds max length', () => {
                // Arrange
                const candidate = {
                    ...validCandidateMinimal,
                    workExperiences: [{ ...validWorkExperience, company: 'A'.repeat(101) }],
                };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).toThrow('Invalid company');
            });

            test('should throw error when work experience position is missing', () => {
                // Arrange
                const candidate = {
                    ...validCandidateMinimal,
                    workExperiences: [{ ...validWorkExperience, position: undefined }],
                };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).toThrow('Invalid position');
            });

            test('should throw error when work experience position exceeds max length', () => {
                // Arrange
                const candidate = {
                    ...validCandidateMinimal,
                    workExperiences: [{ ...validWorkExperience, position: 'A'.repeat(101) }],
                };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).toThrow('Invalid position');
            });

            test('should throw error when work experience description exceeds max length', () => {
                // Arrange
                const candidate = {
                    ...validCandidateMinimal,
                    workExperiences: [{ ...validWorkExperience, description: 'A'.repeat(201) }],
                };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).toThrow('Invalid description');
            });

            test('should pass validation when work experience description is undefined', () => {
                // Arrange
                const candidate = {
                    ...validCandidateMinimal,
                    workExperiences: [{ ...validWorkExperience, description: undefined }],
                };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).not.toThrow();
            });

            test('should throw error when work experience startDate is invalid', () => {
                // Arrange
                const candidate = {
                    ...validCandidateMinimal,
                    workExperiences: [{ ...validWorkExperience, startDate: 'invalid-date' }],
                };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).toThrow('Invalid date');
            });

            test('should throw error when work experience endDate has invalid format', () => {
                // Arrange
                const candidate = {
                    ...validCandidateMinimal,
                    workExperiences: [{ ...validWorkExperience, endDate: '2023/12/31' }],
                };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).toThrow('Invalid end date');
            });

            test('should pass validation when work experience endDate is undefined', () => {
                // Arrange
                const candidate = {
                    ...validCandidateMinimal,
                    workExperiences: [{ ...validWorkExperience, endDate: undefined }],
                };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).not.toThrow();
            });
        });

        // CV Validation
        describe('CV validation', () => {

            test('should throw error when CV filePath is missing', () => {
                // Arrange
                const candidate = {
                    ...validCandidateMinimal,
                    cv: { fileType: 'application/pdf' },
                };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).toThrow('Invalid CV data');
            });

            test('should throw error when CV fileType is missing', () => {
                // Arrange
                const candidate = {
                    ...validCandidateMinimal,
                    cv: { filePath: 'uploads/cv.pdf' },
                };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).toThrow('Invalid CV data');
            });

            test('should throw error when CV filePath is not a string', () => {
                // Arrange
                const candidate = {
                    ...validCandidateMinimal,
                    cv: { filePath: 123, fileType: 'application/pdf' },
                };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).toThrow('Invalid CV data');
            });

            test('should throw error when CV fileType is not a string', () => {
                // Arrange
                const candidate = {
                    ...validCandidateMinimal,
                    cv: { filePath: 'uploads/cv.pdf', fileType: 123 },
                };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).toThrow('Invalid CV data');
            });

            test('should throw error when CV is not an object', () => {
                // Arrange
                const candidate = {
                    ...validCandidateMinimal,
                    cv: 'not-an-object',
                };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).toThrow('Invalid CV data');
            });

            test('should pass validation when CV is an empty object', () => {
                // Arrange
                const candidate = {
                    ...validCandidateMinimal,
                    cv: {},
                };

                // Act & Assert
                expect(() => validateCandidateData(candidate)).not.toThrow();
            });
        });
    });

    // ========================================
    // GROUP 3: EDGE CASES AND SPECIAL SCENARIOS
    // ========================================

    describe('Edge Cases and Special Scenarios', () => {

        test('should skip validation when candidate has an id (editing mode)', () => {
            // Arrange
            const candidateWithId = {
                id: 1,
                // No other fields - should not throw because id is present
            };

            // Act & Assert
            expect(() => validateCandidateData(candidateWithId)).not.toThrow();
        });

        test('should pass validation with empty educations array', () => {
            // Arrange
            const candidate = {
                ...validCandidateMinimal,
                educations: [],
            };

            // Act & Assert
            expect(() => validateCandidateData(candidate)).not.toThrow();
        });

        test('should pass validation with empty workExperiences array', () => {
            // Arrange
            const candidate = {
                ...validCandidateMinimal,
                workExperiences: [],
            };

            // Act & Assert
            expect(() => validateCandidateData(candidate)).not.toThrow();
        });
    });
});
