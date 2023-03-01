const mongoose = require('mongoose')
import config from './config';
import logger from './logger';

const loadDb = async () => {
  logger.info('Connecting to DB = {}', config.mongoDBUrl)
  const connection = await mongoose.connect(config.mongoDBUrl,{
        useNewUrlParser:true,
        //useCreateIndex:true,
        useUnifiedTopology: true,
        //useFindAndModify:false //to remove deoprecation warning while using find and modify
    })
    logger.info('Connected to MONGO DB Succesfully');
  return connection.connection.db;
}

export default loadDb;