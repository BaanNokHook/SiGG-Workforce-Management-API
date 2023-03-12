import { Service } from 'typedi'
import { IDemo, IDemoRequest } from '../../../domains/demo/interface'
import { IDemoRepository } from '../../../repositories/demo/demo.repository'

let list: IDemo[] = []

@Service('IDemoRepository')
export class DemoMemoryRepository implements IDemoRepository {
  async findAll(): Promise<IDemo[]> {
    return list
  }

  async create(request: IDemoRequest): Promise<IDemo> {
    const newDemo = {
      _id: Date.now().toString(),
      ...request
    }

    list.push(newDemo)

    return newDemo
  }

  async findByName(name: string): Promise<IDemo | null> {
    const result = list.find(l => l.name == name)

    return result || null
  }

  async save(model: IDemo): Promise<IDemo | null> {
    list = list.map(l => {
      if (l._id === model._id) {
        return model
      }

      return l
    })
    return model
  }

}

