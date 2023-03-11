import { prisma } from '~/server/db';
import { Board, ID } from '~/types/board';
import { deleteColumnsAndTasksByBoardId } from './column';

export const createBoard = async (title: string, userId: ID) => {
  const board = await prisma.board.create({
    data: {
      title,
      userId,
    },
  });

  return board;
};

export const getAllBoards = async (): Promise<Board[]> => {
  const boards = (await prisma.board.findMany({
    include: {
      columns: true,
    },
  })) as Board[];

  return boards;
};

export const getBoardById = async (id: ID): Promise<Board | null> => {
  const board = (await prisma.board.findUnique({
    where: {
      id,
    },
    include: {
      columns: true,
    },
  })) as Board | null;

  return board;
};

export const updateBoardById = async (id: ID, title: string) => {
  const board = await prisma.board.update({
    where: {
      id,
    },
    data: {
      title,
    },
  });

  return board;
};

export const deleteBoard = async (id: ID) => {
  try {
    await deleteColumnsAndTasksByBoardId(id);
  } catch (error) {
    return {
      statusCode: 400,
      message: 'Could not delete columns',
    };
  }

  return prisma.board.delete({
    where: {
      id,
    },
  });
};
