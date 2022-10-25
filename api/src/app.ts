import 'reflect-metadata';
import { ApolloServerPluginLandingPageProductionDefault, ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import { buildSchema } from 'type-graphql';
import { Connection, createConnection } from 'typeorm';
import { NODE_ENV, PORT, ORIGIN, CREDENTIALS } from '@config';
import { dbConnection } from '@databases';
import { authMiddleware, authChecker } from '@middlewares/auth.middleware';
import errorMiddleware from '@middlewares/error.middleware';
import { logger, responseLogger, errorLogger } from '@utils/logger';
import { create } from 'domain';
import { createAuthorsLoader } from './utils/authorsLoader';
import { createTagsLoader } from './utils/tagsLoader';
import { createArticlesLoader } from './utils/articleLoader';

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  public connection: Connection

  constructor(resolvers) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;
    this.app.use(express.json({ limit: '50mb' }));

    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initApolloServer(resolvers);
    this.initializeErrorHandling();
  }

  public async listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`🎮 http://localhost:${this.port}/graphql`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private async connectToDatabase() {
    this.connection = await createConnection(dbConnection);
  }

  private initializeMiddlewares() {
    if (this.env === 'production') {
      this.app.use(hpp());
      this.app.use(helmet());
    }

    this.app.use(cors({ origin: ['https://studio.apollographql.com', 'http://localhost:8000'], credentials: CREDENTIALS }));
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private async initApolloServer(resolvers) {
    const schema = await buildSchema({
      resolvers: resolvers,
      authChecker: authChecker,
    });

    const apolloServer = new ApolloServer({
      schema: schema,
      plugins: [
        this.env === 'production'
          ? ApolloServerPluginLandingPageProductionDefault({ footer: false })
          : ApolloServerPluginLandingPageLocalDefault({ footer: false }),
      ],
      context: async ({ req }) => {
        try {
          const user = await authMiddleware(req);
          return {
            user: user,
            authorsLoader: createAuthorsLoader(),
            tagsLoader: createTagsLoader(),
            articleLoader: createArticlesLoader(),
            connection: this.connection
          };
        } catch (error) {
          throw new Error(error);
        }
      },
      formatResponse: (response, request) => {
        responseLogger(request);

        return response;
      },
      formatError: error => {
        errorLogger(error);

        return error;
      },

    });


    await apolloServer.start();
    apolloServer.applyMiddleware({ app: this.app, cors: ORIGIN, path: '/graphql' });
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
