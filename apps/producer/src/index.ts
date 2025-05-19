import { ExpressApp } from "./app"
import { PORT } from "./config"
import { startGRPCServer } from "./grpc/processor"

const main = async () => {
    const app = await ExpressApp()
    app.listen(PORT, () => {
        console.info(`Listening on port ${PORT}`)
    })
    startGRPCServer()
}

main()