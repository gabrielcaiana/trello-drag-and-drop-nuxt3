import bcrypt from 'bcrypt';
import { getUserByEmail } from '~/server/db/users';
import { generateTokens, sendRefreshToken } from '~/server/utils/jwt';
import { userTransformer } from '~/server/transformers';
import { createRefreshToken } from '~/server/db/refreshTokens';
import { sendError } from 'h3';
import { User } from '~/types/user';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body;

  if (!email || !password) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'fields missing',
      })
    );
  }

  const user = (await getUserByEmail(email)) as User;

  if (!user) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'email or password is invalid',
      })
    );
  }

  const doesThePasswordMatch = await bcrypt.compare(password, user.password);

  if (!doesThePasswordMatch) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'email or password is invalid',
      })
    );
  }

  const { accessToken, refreshToken } = generateTokens(user);

  await createRefreshToken({
    token: refreshToken,
    userId: user.id!,
  });

  sendRefreshToken(event, refreshToken);

  return {
    access_token: accessToken,
    user: userTransformer(user),
  };
});
