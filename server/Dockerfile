FROM rust:1.76 AS builder

RUN apt-get update && apt-get install -y libclang-dev cmake && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/server

COPY Cargo.toml Cargo.lock ./

COPY src ./src

RUN cargo build --release
RUN rm -rf src

COPY src ./src
COPY database ./database

RUN cargo build --release

FROM rust:1.76 as runtime

RUN apt-get update && apt-get install -y libssl1.1 ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /usr/src/server/target/release/server /app/server

COPY database /app/database

EXPOSE 5500

CMD ["./server"]
