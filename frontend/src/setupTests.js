// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Use the manual axios mock in src/__mocks__/axios.js so Jest
// doesn't try to parse axios's ESM build during tests.
jest.mock('axios');
