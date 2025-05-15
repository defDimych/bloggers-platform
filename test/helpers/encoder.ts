export const fromUTF8ToBase64 = (
  username: string,
  password: string,
): string => {
  return Buffer.from(`${username}:${password}`).toString('base64');
};
