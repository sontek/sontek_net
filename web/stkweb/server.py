import yaml
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from yaml import CLoader as Loader, CDumper as Dumper
from pathlib import Path
cwd = Path(__file__)
app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/resume")
async def resume():
    resume_path = cwd.parent.parent / 'resume_data/'

    with open(resume_path / 'about.yml') as f:
        about_data = yaml.load(f, Loader=Loader)

    with open(resume_path / 'history.yml') as f:
        history_data = yaml.load(f, Loader=Loader)

    with open(resume_path / 'projects.yml') as f:
        project_data = yaml.load(f, Loader=Loader)

    breakpoint()
    return {"message": "Hello World"}

@app.get("/hello")
async def main():
    return {"message": "Hello World"}

