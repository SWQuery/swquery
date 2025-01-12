# Default target listing all commands
default:
    @echo "Available commands:"
    @just --list

# ========= Container Commands =========
# Run compose
run-compose:
    @echo "Running compose..."
    docker compose -f deployment/compose.yml up --build -d

# ========= Build Commands =========
# Build SDK
build-sdk:
    @echo "Building SDK..."
    cargo build -p sdk --release

# Build Server
build-server:
    @echo "Building Server..."
    cargo build -p server --release

# Build Credit-Sales Program
build-credit-sales:
    @echo "Building Credit-Sales Program..."
    cargo build-sbf --manifest-path credit-sales/Cargo.toml

# Build Frontend
build-frontend:
    @echo "Building Frontend..."
    cd frontend && yarn build

# Build All
build-all:
    @echo "Building all projects..."
    just build-sdk
    just build-credit-sales
    just build-server
    just build-frontend

# ========= Run Commands =========
# Run Server
run-server:
    @echo "Running Server..."
    cargo run -p server

# Run Frontend
run-frontend:
    @echo "Running Frontend..."
    cd frontend && yarn dev

# Run All
run-all:
    @echo "Running all services..."
    just run-server & just run-frontend

# Run AI Agent
run-agent:
    @echo "Running AI Agent..."
    cd ai-agent && \
    python -m venv .venv && \
    source .venv/bin/activate && \
    pip install -r requirements.txt && \
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# ========= Test Commands =========
# Test SDK
test-sdk:
    @echo "Testing SDK..."
    cargo test -p sdk -- --nocapture

# Test Credit-Sales
test-credit-sales:
    @echo "Testing Credit-Sales Program..."
    cargo test-sbf --manifest-path credit-sales/Cargo.toml -- --nocapture

# Test Server
test-server:
    @echo "Testing Server..."
    cargo test -p server

# Test All
test-all:
    @echo "Testing all projects..."
    just test-sdk
    just test-credit-sales
    just test-server

# ========= Clean Commands =========
# Clean SDK
clean-sdk:
    @echo "Cleaning SDK..."
    cargo clean -p sdk

# Clean Credit-Sales Program
clean-credit-sales:
    @echo "Cleaning Credit-Sales Program..."
    cargo clean --manifest-path credit-sales/Cargo.toml

# Clean Server
clean-server:
    @echo "Cleaning Server..."
    cargo clean -p server

# Clean All
clean-all:
    @echo "Cleaning all projects..."
    cargo clean
    just clean-sdk
    just clean-credit-sales
    just clean-server

# ========= Check and Format Commands =========
# Check and Format All
check-fmt:
    @echo "Checking and formatting..."
    cargo check -p swquery
    cargo check --manifest-path credit-sales/Cargo.toml
    cargo check -p server
    cargo +nightly fmt --all
