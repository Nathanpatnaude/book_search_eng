import { gql } from '@apollo/client';

export const GET_ME = gql`
  {
    me {
      _id
      udername
      email
      bookCount
      savedBooks {
        bookId
        authors
        title
        desscription
        image
        link
      }
    }
  }
`;
