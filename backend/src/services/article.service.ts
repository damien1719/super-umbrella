import { prisma } from '../prisma/client';
import { Article } from '@prisma/client';

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
