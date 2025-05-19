const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
import { GRPC_PORT } from "../config/index"
import {sendMoneyService} from "../service/sendMoney"

// Load protobuf
const PROTO_PATH = path.join(__dirname, 'proto', 'transaction.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition).user;

const server = new grpc.Server();

const processor = (call: any, callback: any) => {
    try {
        console.log("call from GRPC client")
        const res = call.request;
        console.log("cominge GPRC clien   +++++>", res);
        sendMoneyService(res)
    } catch (error) {
        callback({
            code: grpc.status.INTERNAL,
            message: (error as Error).message
        });
    }
}

// Add the service implementation
server.addService(protoDescriptor.ProcessorService.service, {
    processor
});

// Function to start the server
function startGRPCServer() {
    server.bindAsync(
        `0.0.0.0:${GRPC_PORT || 50051}`,
        grpc.ServerCredentials.createInsecure(),
        (err: any, port: any) => {
            if (err) {
                console.error('Failed to start gRPC server:', err);
                return;
            }

            console.log(`gRPC server running on port ${port}`);
            server.start();
        }
    );
}

export { startGRPCServer }