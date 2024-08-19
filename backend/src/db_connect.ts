import { Sequelize } from 'sequelize';

const devMode = process.env.NODE_ENV === 'development'
const DEVfolder = process.env.DEV_FOLDER
const PRODfolder = process.env.PROD_FOLDER
const folder = devMode ? DEVfolder : PRODfolder

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: `${folder}/database.sqlite`,
});
