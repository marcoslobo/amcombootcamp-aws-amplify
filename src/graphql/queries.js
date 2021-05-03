/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getAuditoria = /* GraphQL */ `
  query GetAuditoria($id: ID!) {
    getAuditoria(id: $id) {
      id
      email
      action
      key
      createdAt
      updatedAt
    }
  }
`;
export const listAuditorias = /* GraphQL */ `
  query ListAuditorias(
    $filter: ModelAuditoriaFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAuditorias(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        email
        action
        key
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
