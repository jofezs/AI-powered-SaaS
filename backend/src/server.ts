import dotenv from 'dotenv';

dotenv.config({ override: true });

import app from './app';
import connectDB from './config/database';

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
    });

    process.on('unhandledRejection', (reason: Error) => {
      console.error('💥 UNHANDLED REJECTION:', reason.message);
      server.close(() => process.exit(1));
    });

    process.on('uncaughtException', (error: Error) => {
      console.error('💥 UNCAUGHT EXCEPTION:', error.message);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
  }
};

startServer();