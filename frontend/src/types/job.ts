export enum Job {
  PSYCHOMOTRICIEN = 'PSYCHOMOTRICIEN',
  ERGOTHERAPEUTE = 'ERGOTHERAPEUTE',
  NEUROPSYCHOLOGUE = 'NEUROPSYCHOLOGUE',
}

export const jobLabels: Record<Job, string> = {
  [Job.PSYCHOMOTRICIEN]: 'Psychomotricien-ne',
  [Job.ERGOTHERAPEUTE]: 'Ergothérapeute',
  [Job.NEUROPSYCHOLOGUE]: 'Neuropsychologue',
};

export const jobOptions: { id: Job; label: string }[] = Object.entries(
  jobLabels,
).map(([id, label]) => ({ id: id as Job, label }));
