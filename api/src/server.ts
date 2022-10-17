import App from '@/app';
import validateEnv from '@utils/validateEnv';

import { authResolver } from '@resolvers/auth.resolver';
import { userResolver } from '@resolvers/users.resolver';
import { AuthorBookResolver } from './resolvers/authorbook.resolver';
import { ArticleTagResolver } from './resolvers/articletag.resolver';

validateEnv();

const app = new App([
    authResolver,
	userResolver,
	AuthorBookResolver,
    ArticleTagResolver
]);

app.listen();
