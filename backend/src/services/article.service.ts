import { prisma } from '../prisma/client';

export interface Article {
  id: bigint;
  masked: boolean;
  mnem: string | null;
  prTexte: string;
  dureeMini: number;
  dureeMaxi: number;
  [key: string]: unknown;
}

export const ArticleService = {
  create(data: Omit<Article, 'id'>) {
    return prisma.article.create({ data });
  },

  list() {
    return prisma.article.findMany();
  },

  get(id: bigint) {
    return prisma.article.findUnique({ where: { id } });
  },

  update(id: bigint, data: Partial<Article>) {
    return prisma.article.update({ where: { id }, data });
  },

  remove(id: bigint) {
    return prisma.article.delete({ where: { id } });
  },
};
