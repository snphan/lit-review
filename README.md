# Lit Review An App To Streamline Lit-Review Summaries

A function application to store summaries as you do a Literature Review. You can make custom tags that you can filter by. 
Supports PDF attachments and filtering by fields.

Contains a Rich-Text Editor powered by Draft.js with shortcut keys.

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

We can upload PDFs as an [Int] into postgres. Just need to convert back 
to Uint8Array -> Blob -> URL when we want to embed it.

```typescript
const files = Array.from(e.target.files!);
const file = files[0];

if (pdfURL) {
    URL.revokeObjectURL(pdfURL)
    setPdfURL("");
}
let x: Uint8Array;
file.arrayBuffer().then(buff => {
    x = new Uint8Array(buff);
    setEditData({ ...editData, pdf: Array.from(x) });
}).then(() => {
    const fileBlob = new Blob([x], { type: "application/pdf" })
    const newURL = URL.createObjectURL(fileBlob);
    setPdfURL(newURL);
})
```




