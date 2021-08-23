module.exports = (users) => {
  const ids = users.map((user) => {
    return user.id;
  });
  return ids;
};
