import { validateCandidateData } from '../application/validator';
import { addCandidate } from '../application/services/candidateService';
import { Candidate } from '../domain/models/Candidate';
import { Education } from '../domain/models/Education';
import { WorkExperience } from '../domain/models/WorkExperience';
import { Resume } from '../domain/models/Resume';
import { PrismaClient } from '@prisma/client';

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
jest.mock('../domain/models/Candidate');
jest.mock('../domain/models/Education');
jest.mock('../domain/models/WorkExperience');
jest.mock('../domain/models/Resume');

// ========================================
// TEST FIXTURES - Reusable test data
// ========================================

const validCandidateMinimal = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
};

const validCandidateFull = {
    firstName: 'María',
    lastName: 'García López',
    email: 'maria.garcia@example.com',
    phone: '612345678',
    address: 'Calle Mayor 123, Madrid',
    educations: [
        {
            institution: 'Universidad Complutense',
            title: 'Computer Science',
            startDate: '2015-09-01',
            endDate: '2019-06-30',
        },
    ],
    workExperiences: [
        {
            company: 'Tech Corp',
            position: 'Software Developer',
            description: 'Full stack development',
            startDate: '2019-07-01',
            endDate: '2022-12-31',
        },
    ],
    cv: {
        filePath: 'uploads/cv-12345.pdf',
        fileType: 'application/pdf',
    },
};

const validEducation = {
    institution: 'MIT',
    title: 'Master in AI',
    startDate: '2020-09-01',
    endDate: '2022-06-30',
};

const validWorkExperience = {
    company: 'Google',
    position: 'Senior Engineer',
    description: 'Backend development',
    startDate: '2020-01-01',
    endDate: '2023-12-31',
};

const validCV = {
    filePath: 'uploads/resume.pdf',
    fileType: 'application/pdf',
};

// ========================================
// VALIDATION TESTS
// ========================================

describe('Candidate Validation', () => {

    // ========================================
    // HAPPY PATH - Valid candidate data
    // ========================================

    describe('Valid candidate data', () => {

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

    // ========================================
    // EDGE CASES - Required field validation
    // ========================================

    describe('Required field validation', () => {

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

    // ========================================
    // EDGE CASES - Optional field validation
    // ========================================

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

    // ========================================
    // EDGE CASES - Nested object validation
    // ========================================

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

    // ========================================
    // SPECIAL CASES
    // ========================================

    describe('Special cases', () => {

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

// ========================================
// DATABASE SERVICE TESTS
// ========================================

describe('Candidate Service - Database Operations', () => {

    let mockCandidateSave: jest.Mock;
    let mockEducationSave: jest.Mock;
    let mockWorkExperienceSave: jest.Mock;
    let mockResumeSave: jest.Mock;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Setup mock implementations
        mockCandidateSave = jest.fn().mockResolvedValue({
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: null,
            address: null,
        });

        mockEducationSave = jest.fn().mockResolvedValue({
            id: 1,
            candidateId: 1,
        });

        mockWorkExperienceSave = jest.fn().mockResolvedValue({
            id: 1,
            candidateId: 1,
        });

        mockResumeSave = jest.fn().mockResolvedValue({
            id: 1,
            candidateId: 1,
        });

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
                save: mockCandidateSave,
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
                save: mockEducationSave,
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
                save: mockWorkExperienceSave,
            } as any;
        });

        // Mock Resume constructor and methods
        (Resume as jest.MockedClass<typeof Resume>).mockImplementation((data: any) => {
            return {
                id: data.id,
                filePath: data.filePath,
                fileType: data.fileType,
                candidateId: data.candidateId,
                save: mockResumeSave,
            } as any;
        });
    });

    // ========================================
    // HAPPY PATH - Successfully adding candidates
    // ========================================

    describe('Successfully adding candidates', () => {

        test('should successfully add candidate with only required fields', async () => {
            // Arrange
            const candidateData = validCandidateMinimal;

            // Act
            const result = await addCandidate(candidateData);

            // Assert
            expect(result).toBeDefined();
            expect(result.id).toBe(1);
            expect(result.email).toBe(candidateData.email);
            expect(mockCandidateSave).toHaveBeenCalledTimes(1);
            expect(mockEducationSave).not.toHaveBeenCalled();
            expect(mockWorkExperienceSave).not.toHaveBeenCalled();
            expect(mockResumeSave).not.toHaveBeenCalled();
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
            expect(mockCandidateSave).toHaveBeenCalledTimes(1);
            expect(mockEducationSave).toHaveBeenCalledTimes(1);
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
            expect(mockCandidateSave).toHaveBeenCalledTimes(1);
            expect(mockEducationSave).toHaveBeenCalledTimes(2);
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
            expect(mockCandidateSave).toHaveBeenCalledTimes(1);
            expect(mockWorkExperienceSave).toHaveBeenCalledTimes(1);
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
            expect(mockCandidateSave).toHaveBeenCalledTimes(1);
            expect(mockWorkExperienceSave).toHaveBeenCalledTimes(2);
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
            expect(mockCandidateSave).toHaveBeenCalledTimes(1);
            expect(mockResumeSave).toHaveBeenCalledTimes(1);
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
            expect(mockCandidateSave).toHaveBeenCalledTimes(1);
            expect(mockEducationSave).toHaveBeenCalledTimes(1);
            expect(mockWorkExperienceSave).toHaveBeenCalledTimes(1);
            expect(mockResumeSave).toHaveBeenCalledTimes(1);
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
            expect(mockResumeSave).not.toHaveBeenCalled();
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
    // EDGE CASES - Database constraint violations
    // ========================================

    describe('Database constraint violations', () => {

        test('should throw specific error when email already exists (P2002)', async () => {
            // Arrange
            const candidateData = validCandidateMinimal;
            const duplicateEmailError = {
                code: 'P2002',
                meta: { target: ['email'] },
            };
            mockCandidateSave.mockRejectedValue(duplicateEmailError);

            // Act & Assert
            await expect(addCandidate(candidateData)).rejects.toThrow(
                'The email already exists in the database'
            );
        });

        test('should propagate database connection errors', async () => {
            // Arrange
            const candidateData = validCandidateMinimal;
            const connectionError = new Error('Database connection failed');
            mockCandidateSave.mockRejectedValue(connectionError);

            // Act & Assert
            await expect(addCandidate(candidateData)).rejects.toThrow(
                'Database connection failed'
            );
        });

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

        test('should handle errors during education save', async () => {
            // Arrange
            const candidateData = {
                ...validCandidateMinimal,
                educations: [validEducation],
            };
            const saveError = new Error('Failed to save education');
            mockEducationSave.mockRejectedValue(saveError);

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
            mockWorkExperienceSave.mockRejectedValue(saveError);

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
            mockResumeSave.mockRejectedValue(saveError);

            // Act & Assert
            await expect(addCandidate(candidateData)).rejects.toThrow(
                'Failed to save resume'
            );
        });
    });

    // ========================================
    // EDGE CASES - Relationship handling
    // ========================================

    describe('Relationship handling', () => {

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
            expect(mockEducationSave).toHaveBeenCalledTimes(3);
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
            expect(mockWorkExperienceSave).toHaveBeenCalledTimes(3);
        });

        test('should save candidate before saving related entities', async () => {
            // Arrange
            const candidateData = {
                ...validCandidateMinimal,
                educations: [validEducation],
            };

            const saveOrder: string[] = [];

            mockCandidateSave.mockImplementation(async () => {
                saveOrder.push('candidate');
                return { id: 1, email: 'test@example.com' };
            });

            mockEducationSave.mockImplementation(async () => {
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
            expect(mockEducationSave).not.toHaveBeenCalled();
            expect(mockWorkExperienceSave).not.toHaveBeenCalled();
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
            mockCandidateSave.mockResolvedValue(expectedCandidate);

            // Act
            const result = await addCandidate(candidateData);

            // Assert
            expect(result).toEqual(expectedCandidate);
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('email');
        });
    });
});
