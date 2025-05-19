import { expressApp } from "./app";
import { PORT } from "./config";

const main = async () => {
    const app = await expressApp()

    app.listen(PORT, () => {
        console.info(`Fraud App listening on port ${PORT}`)
    })
}
main()