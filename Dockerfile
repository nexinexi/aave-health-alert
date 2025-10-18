FROM oven/bun:latest

WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json bun.lock ./
RUN bun install

# Copy the rest of the source
COPY . .

# Run in production mode
CMD ["bun", "start"]
