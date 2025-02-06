declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'dev' | 'prod';
    C7_APP_ID: string;
    C7_APP_SECRET: string;
    CONNECTION_STRING: string;
  }
}
