const { User, Thought} = require('../models')
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    //retrieving existing data, mongoose syntax
    Query: {
        me: async (parent, args, context) =>{
            if(context.user) {
            const userData = await User.findOne({})
                .select('-__ -password')
                .populate('thoughts')
                .populate('friends');

                return userData
        }
        throw new AuthenticationError('Not logged in')
    },
        //'parent' is placeholder parameter
        thoughts: async (parent, { username }) =>{
            //if a username is entered as an argument in the query, find that specific user, else argument is empty object
            const params = username ? { username } : {}
            return Thought.find(params).sort({ createdAt: -1 })
        },
        thought: async (parent, { _id }) =>{
            return Thought.findOne({ _id });
        },
        //get all users
        users: async ()=> {
            return User.find()
                .select('-__v -password')
                .populate('friends')
                .populate('thoughts')
        },
        //get user by username
        user: async (parent, { username }) =>{
            return User.findOne({ username })
                .select('-__v -password')
                .populate('friends')
                .populate('thoughts')
        }
    },

    //changes to data: create, update, delete 
    Mutation:{
        addUser: async (parent, args)=>{
            const user = await User.create(args)
            const token = signToken(user)
            //must have return statement
            return {token, user};
        },

        login: async(parent, { email, password })=>{
            const user = await User.findOne({ email });
            if(!user) {
                throw new AuthenticationError('Incorrect credentials')
            }
            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials')
            }

            const token = signToken(user)
            return { token, user };
        },

        addThought: async (parent, args, context) => {
            //check if there's context, which means jwt has been validated, which means user is logged in
            if (context.user) {
              const thought = await Thought.create({ ...args, username: context.user.username });
          
              await User.findByIdAndUpdate(
                { _id: context.user._id },
                { $push: { thoughts: thought._id } },
                { new: true }
              );
          
              return thought;
            }
          
            throw new AuthenticationError('You need to be logged in!');
          },

          addReaction: async (parent, { thoughtId, reactionBody }, context) => {
            if (context.user) {
              const updatedThought = await Thought.findOneAndUpdate(
                { _id: thoughtId },
                { $push: { reactions: { reactionBody, username: context.user.username } } },
                { new: true, runValidators: true }
              );
          
              return updatedThought;
            }
          
            throw new AuthenticationError('You need to be logged in!');
          },

          addFriend: async (parent, { friendId }, context) => {
            if (context.user) {
              const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                //addtoset prevents duplicate entries, unlike push
                { $addToSet: { friends: friendId } },
                { new: true }
              ).populate('friends');
          
              return updatedUser;
            }
          
            throw new AuthenticationError('You need to be logged in!');
          }
          
    }
}
    //Mutation notes
    //when used in query will create a fetch request to create new user
    //query in graphql will look like this:
    // mutation addUser($username: String!, $password: String!, $email: String!) {
    //     addUser(username: $username, password: $password, email: $email) {
    //       _id
    //       username
    //       email
    //     }
    //   }
    // and query variables:
    // {
    //     "username": "tester2",
    //     "password": "test12345",
    //     "email": "test2@test.com"
    //   }


module.exports = resolvers;