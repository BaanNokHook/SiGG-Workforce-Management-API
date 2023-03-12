// @flow
type UpdateManyResponse = {
  n: number,
  nModified: number,
  opTime: {
    ts: string,
    t: number,
  },
  electionId: string,
  ok: number,
  operationTime: string,
  $clusterTime: {
    clusterTime: string,
    signature: {
      hash: string,
      keyId: string,
    },
  },
}

export type ResponseSerializer = {
  n: number,
  nModified: number,
  electionId: string,
  ok: number,
  operationTime: string,
}

export function updateManyResponseSerializer(updated: UpdateManyResponse): ResponseSerializer {
  return {
    n: updated.n,
    nModified: updated.nModified,
    electionId: updated.electionId,
    ok: updated.ok,
    operationTime: updated.operationTime,
  }
}

type DeletedResponse = {
  n: number,
  nModified: number,
  opTime: {
    ts: string,
    t: number,
  },
  electionId: string,
  ok: number,
  operationTime: string,
  $clusterTime: {
    clusterTime: string,
    signature: {
      hash: string,
      keyId: string,
    },
  },
}

export function deletedResponseSerializer(deleted: DeletedResponse): ResponseSerializer {
  return {
    n: deleted.n,
    nModified: deleted.nModified,
    electionId: deleted.electionId,
    ok: deleted.ok,
    operationTime: deleted.operationTime,
  }
}
