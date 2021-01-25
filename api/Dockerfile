FROM python:3.9-slim-buster as build
ENV POETRY_VIRTUALENVS_CREATE=false

WORKDIR /srv
RUN apt update
RUN apt install build-essential libffi-dev libssl-dev libyaml-dev patchelf -y
RUN pip install --upgrade pip setuptools poetry auditwheel

COPY pyproject.toml poetry.lock ./
RUN poetry install --no-dev
RUN poetry export -f requirements.txt -o requirements.txt --without-hashes
RUN pip wheel -w wheelhouse -r requirements.txt
COPY wheely.sh .
RUN ./wheely.sh
# verify that YAML is fast.
RUN python3 -c "import yaml; yaml.CLoader"

EXPOSE 8000
COPY . .
RUN poetry build
RUN pelican

FROM build as dev
WORKDIR /srv
RUN poetry install
CMD ["supervisord", "-n", "-c", "supervisor.ini"]

FROM python:3.9-slim-buster as prod
WORKDIR /srv
RUN apt update
RUN apt install rsync -y
COPY --from=build /srv/wheelhouse/ ./wheelhouse
COPY --from=build /srv/dist/ ./dist
COPY --from=build /srv/output/ ./output/
RUN pip3 install --no-index --find-links ./wheelhouse/ wheelhouse/*.whl
RUN pip3 install --no-index --find-links ./wheelhouse/ dist/*.whl

# verify that YAML is fast.
RUN python3 -c "import yaml; yaml.CLoader"

COPY docker-entrypoint.sh /
ENTRYPOINT /docker-entrypoint.sh
