FROM rust:1.94.1

WORKDIR /usr/src/backend

COPY Cargo.toml Cargo.lock ./

RUN cargo install cargo-watch

COPY src ./src

CMD ["cargo", "watch", "-x", "run"]
