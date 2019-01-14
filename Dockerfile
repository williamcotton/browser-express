FROM node:7.9

ADD . /code
WORKDIR /code

RUN npm install

EXPOSE 80

CMD npm test
