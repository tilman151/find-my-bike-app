FROM python:3.9

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY ./requirements.txt /config/requirements.txt

RUN pip install --upgrade pip
RUN pip install -r /config/requirements.txt

COPY ./backend /usr/src/app/backend
COPY ./alembic /usr/src/app/alembic
COPY ./alembic.ini /usr/src/app/alembic.ini

COPY .env.backend.prod /config/.env.prod
COPY ./entrypoint.sh /usr/src/app/entrypoint.sh

WORKDIR /usr/src/app

RUN ["chmod", "+x", "./entrypoint.sh"]

EXPOSE 8080
ENTRYPOINT ["./entrypoint.sh"]