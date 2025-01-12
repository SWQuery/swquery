FROM rust:1.82 AS builder

RUN apt-get update && apt-get install -y libclang-dev cmake && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/server

COPY server/Cargo.toml server/Cargo.lock ./

COPY server/src ./src

RUN cargo build --release
RUN rm -rf src

COPY server/src ./src
COPY server/database ./database
COPY server/test.sh ./test.sh

RUN cargo build --release

FROM debian:bullseye-slim AS runtime

RUN apt-get update && apt-get install -y libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /usr/src/server/target/release/server /app/server

COPY server/database /app/database
COPY server/test.sh /app/test.sh

RUN chmod +x /app/test.sh

EXPOSE 5500

CMD ["./server"]
