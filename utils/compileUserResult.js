module.exports = (users, userids, referrals, transactions) => {
  return users.map((user) => {
    const referral = referrals.find((r, i) => {
      return user.id == r.userId;
    });
    const transaction = transactions.find((t, i) => {
      return user.id == t.userId;
    });
    const n = user.dataValues;
    delete n["id"];
    return {
      ...n,
      noOfReferral: referral == null ? 0 : referral.dataValues.noOfReferrals,
      totalEarned: referral == null ? 0 : referral.dataValues.totalEarned,
      transactions:
        transaction == null ? 0 : parseInt(transaction.dataValues.transactions),
    };
  });
};
