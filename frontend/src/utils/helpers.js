// Format date
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format date and time
export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    applied: 'info',
    accepted: 'success',
    rejected: 'error',
  };
  return colors[status] || 'default';
};

// Get job type label
export const getJobTypeLabel = (type) => {
  const labels = {
    internship: 'Internship',
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    contract: 'Contract',
  };
  return labels[type] || type;
};
