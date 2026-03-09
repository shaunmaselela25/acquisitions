export const formatValidationErrors = (error) => {
    if (!error || !error.issues) return 'Validation failed ';

    if (Array.isArray(error.issues)) {
        return error.issues.map(issue => {
            const path = issue.path.join('.');
            return `${path}: ${issue.message}`;
        }).join(', ');
    }

    return JSON.stringify(error);
};