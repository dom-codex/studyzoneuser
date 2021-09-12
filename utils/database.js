const Sequelize = require("sequelize");
let sequelize;
if (!process.env.DATABASE_URL) {
  sequelize = new Sequelize(
    process.env.dbName,
    process.env.user,
    process.env.dbPassword,
    {
      // dialect: "mysql",
      port: process.env.port,
      dialect: "postgres",
      host: process.env.host,
    }
  );
} else {
  //sequelize = new Sequelize(process.env.DATABASE_URL);
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
        ssl: true,
        rejectUnauthorized: false
    }
});
}
module.exports = sequelize;
