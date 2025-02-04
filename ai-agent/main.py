from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from controllers import EndPointsRouter

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Add logging middleware: Print request headers and body
@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    print(f"Request headers: {request.headers}")
    print(f"Request body: {await request.body()}")
    response = await call_next(request)
    return response

app.include_router(EndPointsRouter)
