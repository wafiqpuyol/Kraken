import { ExpressApp } from "./app"
import { PORT } from "./config"


const main = async () => {
    const app = await ExpressApp()
    app.listen(PORT, () => {
        console.info(`Listening on port ${PORT}`)
    })
}

main()