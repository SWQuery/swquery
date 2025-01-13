FROM rust:1.82 AS builder

WORKDIR /usr/src/server

RUN apt-get update && apt-get install -y libclang-dev cmake

COPY server/Cargo.toml server/Cargo.lock ./
COPY server/src ./src
COPY swquery /usr/src/swquery

RUN cargo build --release

# Runtime
FROM debian:bookworm-slim AS runtime

RUN apt-get update && apt-get install -y clang libssl-dev ca-certificates

WORKDIR /app
COPY --from=builder /usr/src/server/target/release/server /app/server

EXPOSE 5500

CMD ["/app/server"]