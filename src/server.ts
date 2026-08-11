import app from './app'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Démarrage du serveur
async function startServer(): Promise<void> {
    try {
        app.listen(process.env.PORT, (): void => {
            console.log(`Server started on http://localhost:${process.env.PORT}`);
        });
    } catch (error) {
        console.error('Startup error:', error);
        process.exit(1);
    }
}

startServer().catch((error: unknown): void => {
    console.error('Fatal error:', error);
    process.exit(1);
});
