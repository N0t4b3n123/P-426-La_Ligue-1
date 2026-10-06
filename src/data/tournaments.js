export const STATUSES = {
  registration_open: 'Registration open',
  in_progress: 'In progress',
  finished: 'Finished',
};

export const testTournaments = [
  {
    id: 1,
    name: 'ETML Cup',
    game: 'Rocket League',
    date: '2026-12-22',
    registrationDeadline: '2026-12-15', 
    maxTeams: 8,
    status: 'registration_open',
    organizer: 'Alex Organizer',
  },
  {
    id: 2,
    name: 'Lausanne Open',
    game: 'Counter-Strike 2',
    date: '2027-01-16',
    registrationDeadline: '2027-01-09',
    maxTeams: 16,
    status: 'registration_open',
    organizer: 'Alex Organizer',
  },
];
