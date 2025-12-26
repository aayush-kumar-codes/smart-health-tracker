// root/package.json
{
  "name": "project-name",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "node server/index.js",
    "client": "npm start --prefix client",
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "nodemon server/index.js"
  },
  "dependencies": {
    "express": "^4.17.1",
    "mongoose": "^5.10.9",
    "graphql": "^15.5.0",
    "express-graphql": "^0.12.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^2.0.7",
    "concurrently": "^5.3.0"
  }
}

// root/server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema/schema');

const app = express();
app.use(cors());

mongoose.connect('mongodb://localhost:27017/project-name', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true,
}));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// root/server/schema/schema.js
const graphql = require('graphql');

const { GraphQLObjectType, GraphQLString, GraphQLSchema } = graphql;

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    hello: {
      type: GraphQLString,
      resolve() {
        return 'Hello World!';
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery
});

// root/client/package.json
{
  "name": "client",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^17.0.2",
    "react-dom": "^17.0.2",
    "react-scripts": "4.0.3",
    "apollo-client": "^2.6.10",
    "apollo-cache-inmemory": "^1.6.6",
    "apollo-link-http": "^1.5.16",
    "graphql-tag": "^2.12.6"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}

// root/client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ApolloProvider } from 'react-apollo';
import ApolloClient from 'apollo-boost';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql'
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);

// root/client/src/App.js
import React from 'react';

function App() {
  return (
    <div>
      <h1>Welcome to the Project</h1>
    </div>
  );
}

export default App;

// root/Dockerfile
FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000
CMD ["npm", "start"]

// root/docker-compose.yml
version: '3'
services:
  web:
    build: .
    ports:
      - "4000:4000"
    volumes:
      - .:/usr/src/app
    depends_on:
      - mongo
  mongo:
    image: mongo
    ports:
      - "27017:27017"