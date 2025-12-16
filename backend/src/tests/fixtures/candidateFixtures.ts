/**
 * Shared test data fixtures for candidate tests
 *
 * This file contains reusable test data objects that can be imported
 * by any test file to avoid duplication and ensure consistency.
 */

// ========================================
// VALID TEST DATA
// ========================================

export const validCandidateMinimal = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
};

export const validCandidateFull = {
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

export const validEducation = {
    institution: 'MIT',
    title: 'Master in AI',
    startDate: '2020-09-01',
    endDate: '2022-06-30',
};

export const validWorkExperience = {
    company: 'Google',
    position: 'Senior Engineer',
    description: 'Backend development',
    startDate: '2020-01-01',
    endDate: '2023-12-31',
};

export const validCV = {
    filePath: 'uploads/resume.pdf',
    fileType: 'application/pdf',
};

// ========================================
// BUILDER FUNCTIONS
// ========================================

/**
 * Creates a candidate object with custom overrides
 * @param overrides - Properties to override in the base candidate
 * @returns Candidate object with merged properties
 */
export const buildCandidate = (overrides: any = {}) => ({
    ...validCandidateMinimal,
    ...overrides,
});

/**
 * Creates an education object with custom overrides
 * @param overrides - Properties to override in the base education
 * @returns Education object with merged properties
 */
export const buildEducation = (overrides: any = {}) => ({
    ...validEducation,
    ...overrides,
});

/**
 * Creates a work experience object with custom overrides
 * @param overrides - Properties to override in the base work experience
 * @returns WorkExperience object with merged properties
 */
export const buildWorkExperience = (overrides: any = {}) => ({
    ...validWorkExperience,
    ...overrides,
});

/**
 * Creates a CV object with custom overrides
 * @param overrides - Properties to override in the base CV
 * @returns CV object with merged properties
 */
export const buildCV = (overrides: any = {}) => ({
    ...validCV,
    ...overrides,
});
