import app from './app.js';

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`BESD-FN-022 API listening on port ${port}`));
