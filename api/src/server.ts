import App from '@/app';
import validateEnv from '@utils/validateEnv';

import { authResolver } from '@resolvers/auth.resolver';
import { userResolver } from '@resolvers/users.resolver';
import { articleResolver } from '@resolvers/article.resolver' 
import { tagResolver } from '@resolvers/tag.resolver';
import { AuthorBookResolver } from './resolvers/authorbook.resolver';

validateEnv();

const app = new App([authResolver, userResolver, articleResolver, tagResolver, AuthorBookResolver]);

app.listen();
