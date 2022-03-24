import chalk from 'chalk';

const log = console.log;

export const logger = {
  log: (msg: string) => log(chalk.blue(msg)),
  error: (msg: any) => log(chalk.red(msg)),
};
