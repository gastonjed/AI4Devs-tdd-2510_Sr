# Prompt 1

you are an expert software developer with experience in TDD and unit test.

your task is to set up the current project so I can execute unit tests directly in the terminal using the command "npm test"

the code is written in Typescript. The best option is using ts-jest (docs: https://github.com/kulshekhar/ts-jest)

do not implement any tests, just prepare the project and environment so "npm test" command works.


# Prompt 2

## Role
You are an expert software developer, with deep knowledge of testing techniques and following TDD (Test Driven Development), agile methodologies and "Fake It 'Til You Make It".

## Objective
Your task is to create a suite of unit tests using Jest for the feature "adding candidates into the database".

## Context
Use the project context @README.md to create relevant tests for the business case.

Consider that tests must cover each process at least with one test for the two tests families:
- data reception via the form
- data load into the database

Apply good practices for development, coding and testing. For instance some of those (not the only ones):
- naming: descriptive name for each test clearly exposing what the test is doing
- Arrange-Act-Assert: structure your tests using arrange-act-assert for better clarity, legibility and maintenance
- parametrization: for tests following the same pattens, avoid duplicated code using parametrization
- assert message: optional assert message to understand if the test fails what are the expectations
- edge cases: not only the happy path should be tested
- mock database: If any of the tests requires to modify the database, then mock it so data does not change (related information about this: https://www.prisma.io/blog/testing-series-1-8eRB5p0Y8o#mock-prisma-client).

## Output

First PLAN the test to be implemented and wait for my confirmation to proceed. Just then implement them.

You must generate a file `tests-GDT.test.ts` in the folder `backend/src/tests`.

Also, document the tests properly in a separate markdown.

# Prompt 3

having only one @backend/src/tests/tests-GDT.test.ts file looks a bit complex. Propose a plan to refactor it based on good practices. Do not implement it until I confirm it. If I approve, then both tests and docs  @backend/tests-GDT-documentation.md must be updated.

# Prompt 4

Looking at @backend/tests-GDT-documentation.md and @prompts-GDT.md, give me a simple, quick and summarized description that I can add in the PR.

It must be in md format so I can copy and paste it