# Lit Review An App To Streamline Lit-Review Summaries

A template to work with Postgres, Express, React, Node.js and GraphQL

# Quickstart

1. Install docker https://docs.docker.com/get-docker/
1. Make a .env.development.local or .env.production.local file like this

**`.env.development.local`**
```
# PORT
PORT = 3000

# DATABASE
DB_HOST = pg
DB_PORT = 5432
DB_USER = root
DB_PASSWORD = password
DB_DATABASE = dev

# TOKEN
SECRET_KEY = secretKey

# LOG
LOG_FORMAT = dev
LOG_DIR = ../logs

# CORS
ORIGIN = https://studio.apollographql.com
CREDENTIALS = true
```

1. In root, run the following command (-d: background)

        docker-compose up -d --build

1. api will be at http://localhost:3000 and Client will be at http://localhost:8000

Have fun developing!

# Learnings

We can toggle typeORM where clause by using a destructor like so. If any of the fields are null, they don't get added.

```typescript
    const nonTagFilterArticles = await ArticleEntity.find(
      {
        where: {
          ...(dates && { year: Between(dates[0], dates[1]) }), // Destruct and add to where only if dates exists.
          ...(authorKeyword && { firstAuthor: Like(authorKeyword) }), // Destruct and add to where only if author exists.
          ...(summaryKeyword && { summary: Like(summaryKeyword) }), // Destruct and add to where only if summary exists.
          ...(titleKeyword && { title: Like(titleKeyword) }), // Destruct and add to where only if title exists.
        }
      })
```





