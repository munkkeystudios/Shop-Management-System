import api from './api';

export const loansAPI = {
    getAll: () => api.get('/loans'), 
    getById: (id) => api.get(`/loans/${id}`), 
    getByLoanNumber: (loanNumber) => api.get(`/loans/loan-number/${loanNumber}`), 
    create: (loanData) => api.post('/loans', loanData), 
    updateRepayment: (id, repaymentData) => api.put(`/loans/${id}/repayment`, repaymentData), 
    delete: (id) => api.delete(`/loans/${id}`), 
    validateLoan: (loanNumber) => api.post('/loans/validate-loan', { loanNumber }),
};

export default loansAPI;