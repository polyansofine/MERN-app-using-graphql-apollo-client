//schema.js

const graphql = require("graphql"); //use graphql package

const _ = require("lodash");

const cars = require("../models/car");
const owners = require("../models/owner");

/*Getting GraphQLObjectType function from 'graphql' to define the (dataType) 
 structure of our queries and their model type.
*/
const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
} = graphql;

//Defining CarType with its fields.
const CarType = new GraphQLObjectType({
  name: "Car",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    model: { type: GraphQLInt },
    company: { type: GraphQLString },
    owner: {
      type: OwnerType,
      resolve(parent, args) {
        return owners.findById(parent.ownerId);
        // return _.find(OwnersArray, { id: parent.ownerId });
      },
    }, //owner
  }),
});

//Defining CarType with its fields.
const OwnerType = new GraphQLObjectType({
  name: "Owner",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    gender: { type: GraphQLString },
    cars: {
      type: new GraphQLList(CarType),
      resolve(parent, args) {
        return cars.find({ ownerId: parent.id });
        //return _.filter(CarsArray, { ownerId: parent.id });
      },
    },
  }),
});

//Defining RootQuery
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    // Fields here will be the query for frontends
    //We are defining a 'car' query which can take (car ID ) to search in DB.
    car: {
      type: CarType, //Defining model for car Query
      args: { id: { type: GraphQLID } }, //args field to extract
      // argument came with car query, e.g : Id of the car object to extract its details.
      resolve(parent, args) {
        //code to get value  from DB
        /**
         * With the help of lodash library(_), we are trying to find car with id from 'CarsArray'
         * and returning its required data to calling tool.
         */
        //return _.find(CarsArray, { id: args.id });
      }, //resolve function
    }, //car query ends here
    owner: {
      type: OwnerType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return owners.findById(args.id);
        // return _.find(OwnersArray, { id: args.id });
      },
    }, //owners ends here
    cars: {
      type: new GraphQLList(CarType),
      resolve(parent, args) {
        return cars.find({});
        //return CarsArray;
      },
    }, //cars query
    owners: {
      type: new GraphQLList(OwnerType),
      resolve(parent, args) {
        return owners.find({});
        //return OwnersArray;
      },
    },
  }, //fields end here
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addOwner: {
      // To add Owner in DB
      type: OwnerType,
      args: {
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
        gender: { type: GraphQLString },
      },
      resolve(parent, args) {
        let owner = new owners({
          name: args.name,
          age: args.age,
          gender: args.gender,
        });
        return owner.save(); //create owner data in mlab
      },
    },
    addCar: {
      type: CarType,
      args: {
        name: { type: GraphQLString },
        model: { type: GraphQLInt },
        company: { type: GraphQLString },
        ownerId: { type: GraphQLID },
      },
      resolve(parent, args) {
        let car = new cars({
          name: args.name,
          model: args.model,
          company: args.company,
          ownerId: args.ownerId,
        });

        return car.save();
      },
    }, //addCar
  }, //fields ends here
});

//exporting 'GraphQLSchema with RootQuery' for GraphqlHTTP middleware.
module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
