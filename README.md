# 🧾 Order Processor

The **Order Processor** service can be easily run locally using Docker.

### 🚀 Getting Started

1. **Install Docker**
   Make sure [Docker](https://docs.docker.com/get-docker/) is installed on your system.

2. **Start the Service**
   Run the following command to build and start the containers:

   ```bash
   docker compose up --build
   ```

3. **Stop the Service**
   To stop and remove all containers and associated volumes:

   ```bash
   docker compose down -v
   ```

### To hit the order api you can use this CURL:

```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"product_id": "p1", "quantity": 5}'

```
