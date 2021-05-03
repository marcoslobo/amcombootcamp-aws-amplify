/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createAuditoria = /* GraphQL */ `
  mutation CreateAuditoria(
    $input: CreateAuditoriaInput!
    $condition: ModelAuditoriaConditionInput
  ) {
    createAuditoria(input: $input, condition: $condition) {
      id
      email
      action
      key
      createdAt
      updatedAt
    }
  }
`;
export const updateAuditoria = /* GraphQL */ `
  mutation UpdateAuditoria(
    $input: UpdateAuditoriaInput!
    $condition: ModelAuditoriaConditionInput
  ) {
    updateAuditoria(input: $input, condition: $condition) {
      id
      email
      action
      key
      createdAt
      updatedAt
    }
  }
`;
export const deleteAuditoria = /* GraphQL */ `
  mutation DeleteAuditoria(
    $input: DeleteAuditoriaInput!
    $condition: ModelAuditoriaConditionInput
  ) {
    deleteAuditoria(input: $input, condition: $condition) {
      id
      email
      action
      key
      createdAt
      updatedAt
    }
  }
`;
