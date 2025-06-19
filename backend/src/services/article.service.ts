import { prisma } from '../prisma';

type ArticleData = Record<string, unknown>;

export const ArticleService = {
  create(data: ArticleData) {
    return prisma.article.create({ data });
  },

  list() {
    return prisma.article.findMany();
  },

  get(id: bigint) {
    return prisma.article.findUnique({ where: { id } });
  },

  update(id: bigint, data: Partial<ArticleData>) {
    return prisma.article.update({ where: { id }, data });
  },

  remove(id: bigint) {
    return prisma.article.delete({ where: { id } });
  },
};
