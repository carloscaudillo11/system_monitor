import app from "./app.js";
import connectDB from "./db.js";

const PORT = process.env.PORT || 3000;

const main = async () => {
  try {
    await connectDB();
    app.listen(PORT);
    console.log(`Listening on port http://localhost:${PORT}`);
  } catch (error) {
    console.error(error);
  }
};

main();
