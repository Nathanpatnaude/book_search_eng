const { AuthenticationError } = require("apollo-server-express");
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User
          .findOne({ _id: context.user._id })
          .select("-__v -password")

        return userData;
      };
      throw new AuthenticationError("Not logged in!");
    },
  },

  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError("Username or Password does not match!");
      };

      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError("Username or Password does not match!");
      };

      const token = signToken(user);
      return { token, user };

    },

    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };

    },

    saveBook: async (parent, { userId, bookData }, context) => {
      if (context.user) {
        const updatedUser = await User
          .findOneAndUpdate(
            { _id: userId },
            { $addToSet: { savedBooks: { book: bookData } } },
            { new: true, runValidators: true },
          )
        return updatedUser;
      };
      throw new AuthenticationError("Not logged in!");
    },

    removeBook: async (parent, { book }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: book } },
          { new: true },
        );
        return updatedUser;
      };
      throw new AuthenticationError("Not logged in!");

    }
  },
};

module.exports = resolvers;