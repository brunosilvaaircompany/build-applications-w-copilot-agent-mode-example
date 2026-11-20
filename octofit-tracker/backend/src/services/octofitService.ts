import { Activity, Team, User, Workout } from '../models/index.js';

type HttpError = Error & { status: number };

function badRequest(message: string): HttpError {
  return Object.assign(new Error(message), { status: 400 });
}

function notFound(message: string): HttpError {
  return Object.assign(new Error(message), { status: 404 });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!isRecord(input)) throw badRequest('Informe os dados da atividade.');
  const { userId, teamId, type, minutes } = input;
  if (typeof userId !== 'string' || !User.db.base.isValidObjectId(userId)
    || typeof teamId !== 'string' || !Team.db.base.isValidObjectId(teamId)) {
    throw badRequest('Informe IDs válidos para a pessoa e a equipe.');
  }
  if (!['run', 'walk', 'cycle', 'strength'].includes(String(type))) {
    throw badRequest('Informe um tipo de atividade válido.');
  }
  if (typeof minutes !== 'number' || !Number.isInteger(minutes) || minutes < 1) {
    throw badRequest('A duração deve ser um número inteiro de minutos maior que zero.');
  }

  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user || !team) throw notFound('Pessoa ou equipe não encontrada.');

  return Activity.create({
    user: user._id,
    team: team._id,
    type,
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isRecord(input)) throw badRequest('Informe os dados da equipe.');
  const { name, mascot } = input;
  if (typeof name !== 'string' || !name.trim()) throw badRequest('O nome da equipe é obrigatório.');
  if (typeof mascot !== 'string' || !mascot.trim()) throw badRequest('A mascote da equipe é obrigatória.');

  const members = input.members ?? [];
  if (!Array.isArray(members) || members.some((member) => typeof member !== 'string' || !User.db.base.isValidObjectId(member))) {
    throw badRequest('A lista de integrantes contém um ID inválido.');
  }
  const users = members.length ? await User.find({ _id: { $in: members } }).select('_id') : [];
  if (users.length !== members.length) throw notFound('Uma ou mais pessoas integrantes não foram encontradas.');

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: users.map(({ _id }) => _id) });
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().lean(),
    Activity.aggregate<{ _id: string; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map(totals.map(({ _id, totalPoints }) => [_id.toString(), totalPoints]));
  const rankedTeams = teams
    .map((team) => ({
      teamName: team.name,
      totalPoints: pointsByTeam.get(team._id.toString()) ?? 0,
    }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName));

  return rankedTeams.map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() });
  if (!user) throw notFound('Pessoa não encontrada para este e-mail.');

  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const focusByActivity: Record<string, string> = {
    run: 'endurance',
    cycle: 'endurance',
    walk: 'mobility',
    strength: 'strength',
  };
  const focus = recentActivity ? focusByActivity[recentActivity.type] : user.fitnessGoal;
  let recommendationFocus = focus;
  let workouts = await Workout.find({ focus: recommendationFocus }).sort({ title: 1 }).lean();
  if (!workouts.length && recommendationFocus !== user.fitnessGoal) {
    recommendationFocus = user.fitnessGoal;
    workouts = await Workout.find({ focus: recommendationFocus }).sort({ title: 1 }).lean();
  }

  const reason = !recentActivity || recommendationFocus !== focus
    ? `Esta sugestão corresponde à sua meta de ${user.fitnessGoal}.`
    : `Sua atividade recente de ${recentActivity.type === 'run' ? 'corrida' : recentActivity.type === 'cycle' ? 'ciclismo' : recentActivity.type === 'strength' ? 'força' : 'caminhada'} indica esse foco.`;
  return workouts.map((workout) => ({ ...workout, reason }));
}

export { User };
