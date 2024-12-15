# Define default options
default:
    @echo "Available commands:"
    @just --list

# Build SDK
build-sdk:
    @echo "Building SDK..."
    cargo build -p sdk

# Build Credit-Sales Program
build-credit-sales:
    @echo "Building Credit-Sales Program..."
    cargo build-sbf --manifest-path credit-sales/Cargo.toml

# Build All
build-all:
    @echo "Building all projects..."
    just build-sdk
    just build-credit-sales

# Test SDK
test-sdk:
    @echo "Testing SDK..."
    cargo test -p sdk

# Test Credit-Sales
test-credit-sales:
    @echo "Testing Credit-Sales Program..."
    cargo test-sbf --manifest-path credit-sales/Cargo.toml -- --nocapture

# Test All
test-all:
    @echo "Testing all projects..."
    just test-sdk
    just test-credit-sales

# Clean SDK
clean-sdk:
    @echo "Cleaning SDK..."
    cargo clean -p sdk

# Clean Credit-Sales Program
clean-credit-sales:
    @echo "Cleaning Credit-Sales Program..."
    cargo clean --manifest-path credit-sales/Cargo.toml

# Clean All
clean-all:
    @echo "Cleaning all projects..."
    cargo clean
    just clean-sdk
    just clean-credit-sales