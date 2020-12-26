module.exports = {
  uri: `${process.env.MONGODB_DATABASE_URI}/${process.env.MONGODB_DATABASE_NAME}`,
  options: {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
  },
};
