import { TaskRepo } from '../../models/implementations/taskRepo'
import { TaskStaffsDomain } from './getTaskStaffs'

describe('Task Staffs Domain', () => {
  const taskRepo = new TaskRepo()

  const getTaskByIdSpy = jest.spyOn(taskRepo, 'getTaskById')
  const taskDomain = new TaskStaffsDomain(taskRepo)
  const findStaffSpy = jest.spyOn(taskDomain, 'findStaff')
  const findUserFromAuthSpy = jest.spyOn(taskDomain, 'findUserFromAuth')
  const getStaffsSpy = jest.spyOn(taskDomain, 'getStaffs')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('The consumer should be able to call new() on TaskStaffsDomain', () => {
    expect(taskDomain).toBeTruthy()
  })

  describe('Should get task staff', () => {
    it('Should call method getTaskStaffs', async () => {
      getTaskByIdSpy.mockResolvedValue({
        _id: 'taskIdMock',
        staffs: ['staffId1'],
      })
      findStaffSpy.mockResolvedValue([
        {
          _id: 'staffId',
          userId: 'userId',
        },
      ])
      findUserFromAuthSpy.mockResolvedValue([
        {
          _id: 'userId',
        },
      ])

      await expect(taskDomain.getStaffs('taskIdMock')).resolves.not.toThrow()
      expect(getStaffsSpy).toHaveBeenCalled()
      expect(getTaskByIdSpy).toHaveBeenCalled()
      expect(findStaffSpy).toHaveBeenCalled()
      expect(findUserFromAuthSpy).toHaveBeenCalled()
    })
  })

  describe('Should not get any task staff', () => {
    it('Do not have task, Should not get any staff and throw error', async () => {
      getTaskByIdSpy.mockResolvedValue({})

      await expect(taskDomain.getStaffs('taskIdMock_not_have_system')).rejects.toThrow()
      expect(getStaffsSpy).toHaveBeenCalled()
      expect(getTaskByIdSpy).toHaveBeenCalled()
    })

    it('Do not have task, Should not call method findStaffSpy', async () => {
      getTaskByIdSpy.mockResolvedValue({})

      await expect(taskDomain.getStaffs('taskIdMock_not_have_system')).rejects.toThrow()
      expect(findStaffSpy).not.toHaveBeenCalled()
    })

    it('Do not have task, Should not call method findUserFromAuthSpy', async () => {
      getTaskByIdSpy.mockResolvedValue({})

      await expect(taskDomain.getStaffs('taskIdMock_not_have_system')).rejects.toThrow()
      expect(findUserFromAuthSpy).not.toHaveBeenCalled()
    })
  })
})
