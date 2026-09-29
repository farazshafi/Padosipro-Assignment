import app from './app';
import { env } from './config/env';

const port = env.PORT;

app.listen(port, () => {
    console.log(`=================================`);
    console.log(`🚀 PadosiPro Backend API`);
    console.log(`🌐 Server listening on port: ${port}`);
    console.log(`🔧 Environment: ${env.NODE_ENV}`);
    console.log(`=================================`);
});
