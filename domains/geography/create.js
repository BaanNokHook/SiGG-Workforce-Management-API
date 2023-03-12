import GeographyRepository from '../../models/geography.repository'

export default async (data: any) => {
  const resp = await GeographyRepository.create({
    ...data,
  })
  return resp
}
