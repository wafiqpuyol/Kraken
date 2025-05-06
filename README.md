# 🐙 Kraken - Modern Fiat Currency Wallet

A secure, feature-rich fiat currency wallet system built with a microservices architecture and powered by a robust DevSecOps pipeline.

![Kraken Architecture]([https://github.com/yourusername/kraken-wallet/raw/main/docs/architecture.png](https://excalidraw.com/#json=mMzK5F5U3TBZ1KWkmY44K,hSSqRuemEl2HrF6tPss5NA))

## 🏗️ Architecture Overview

Kraken uses a microservices architecture with multiple interconnected components:

- **Main App**: Core application for user interactions
- **Bank App**: Interfaces with banking systems
- **Webhook Service**: Manages callbacks and integrations
- **Deposit Service**: Handles API requests and middleware
- **Secondary Processor**: For efficient internal service communication
- **Main Processor**: For message queuing and event streaming
- **Notification Service**: Manages real-time alerts to users
- **Fraud Service**: Monitors and flags suspicious activities

The system utilizes both REST and gRPC communication protocols, with WebSocket for real-time data streaming.

## ✨ Features

### Security
- 🔐 Secure user registration & login via phone-number, email & password with magic link email verification
- 🔒 Non-roaming TOTP based SignIn & Withdrawal 2FA via Google Authenticator
- 🛡️ Additional security layers with soft-token & biometric FIDO2 based passkey authentication
- 🔑 Master key for account recovery & 2FA reset
- ⏱️ Instant Wallet/Account lock after consecutive wrong pincode/password attempts
- 🚦 Rate limiting on critical endpoints

### Transactions
- 💸 Deposit from selective banks using webhook token
- 💱 Transfer money in multiple currencies
- 💹 Currency exchange with additional country-based charges
- 🔄 Domestic & International P2P cross-wallet balance transfer with exchange rate fees
- 📊 Row-Level-Lock to ensure smooth transactions & handle race-conditions
- 📱 Pincode-based secure money transfers
- 🔄 Pincode reset via interval-based Emergency Code

### Financial Management
- 🏦 Lock desired amount of money for emergency balance
- 📈 Track Daily & Monthly deposit limits
- 📑 Downloadable transaction invoices
- 📊 Detailed P2P transaction & Deposit history with Aria chart view

### Notifications & Monitoring
- 🔔 Instant notification of P2P transfers (In-house built)
- 🌐 Custom Webhook + WS server (Downstream Service) & bank server (Upstream Service)

### User Experience
- 🌍 I18N support with 7 different languages
- 📧 Password reset & update via email confirmation & custom email templates
- ✉️ Email update via both confirmation + authorization code

### Performance
- ⚡ Unified Redis caching using (read & write aside pattern) for optimized performance
- 📉 Reduced database transactions

## 🛠️ Tech Stack

### Frontend
- React
- Next.js
- TypeScript

### Backend
- Express.js
- Node.js
- Next-Auth
- MySQL
- Redis
- Prisma
- Kafka
- WebSocket
- Python
- Flask
- gRPC
- REST

### DevOps & Tools
- Turborepo
- Docker
- Husky

### CI Pipeline
- GitHub Actions
- NPM
- SonarQube
- Trivy
- Nexus

### Infrastructure as Code
- Terraform

### CD Pipeline & Cloud Services
- AWS Services:
  - IAM
  - EC2
  - ACM
  - Route53
  - ALB
  - EFS
  - RDS
  - CloudWatch
  - S3
  - NAT Gateway
