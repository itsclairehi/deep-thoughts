const { User, Thought} = require('../models')

const resolvers = {
    Query: {
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
    }
}

module.exports = resolvers;