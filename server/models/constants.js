const BRANCHES = ['CSE', 'ISE', 'AIML', 'CD', 'CY', 'ECE', 'EEE', 'ETE', 'EIE', 'ME', 'CV', 'CH', 'BT', 'IEM', 'AE'];

// Order matters: used to decide which status "wins" when merging duplicate students.
const APPLICATION_STATUSES = ['applied', 'shortlisted', 'interview', 'offered', 'rejected'];
const STATUS_RANK = { rejected: 0, applied: 1, shortlisted: 2, interview: 3, offered: 4 };

const DRIVE_STATUSES = ['upcoming', 'ongoing', 'completed'];

module.exports = { BRANCHES, APPLICATION_STATUSES, STATUS_RANK, DRIVE_STATUSES };
