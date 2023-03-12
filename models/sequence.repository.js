import RepositoryBuilder from 'sendit-mongoose-repository'

export const schemaDefinition = {
  key: { type: String, unique: true },
  expiredAt: { type: Date, required: true, index: { expires: 0 } },
  seq: { type: Number, default: 0 },
}

export const builder = RepositoryBuilder('Sequence', schemaDefinition)
export default builder.Repository
