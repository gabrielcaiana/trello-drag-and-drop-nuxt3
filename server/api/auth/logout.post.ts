import { deleteRefreshToken } from '~/server/db/refreshTokens';
import { Token } from '~/types/token';

export default defineEventHandler(async (event) => {
  try {
    const cookie = getCookie(event, 'refresh_token') as Token;
    await deleteRefreshToken(cookie);
  } catch (error) {
    sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'email or password is invalid',
      })
    );
  }

  sendRefreshToken(event, '');

  return {
    message: 'Logout successful',
  };
});
