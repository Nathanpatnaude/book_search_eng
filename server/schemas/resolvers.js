const { AuthenticationError } = require("apollo-server-express");
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User
          .findOne({ _id: context.user._id })
          .select("-__v -password").populate('savedBooks')

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

    saveBook: async (parent, { bookId, authors, title, description, image }, context) => {
      if (context.user) {
        const savedBook = await Book.create({ bookId, authors, title, description, image });
        const updatedUser = await User
          .findOneAndUpdate(
            { _id: context.user._id },
            { $addToSet: { savedBooks: { _id: savedBook._id } }, $inc: { bookCount: 1 } },
            { new: true, runValidators: true },
          ).populate('savedBooks');
        return updatedUser;
      };
      throw new AuthenticationError("Not logged in!");
    },

    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const deleteBook = await Book.findOneAndRemove({ bookId });
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: deleteBook._id }, $inc: { bookCount: -1 } },
          { new: true },
        ).populate('savedBooks');
        return updatedUser;
      };
      throw new AuthenticationError("Not logged in!");

    }
  },
};

module.exports = resolvers;