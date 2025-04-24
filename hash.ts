const password = 'faraway1';

export const hash = await Bun.password.hash(password, {
  algorithm: 'bcrypt',
  cost: 10,
});

console.log(hash);

const isValid = await Bun.password.verify(password, hash, 'bcrypt');

console.log(isValid);
