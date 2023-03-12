import R from 'ramda'

// eslint-disable-next-line import/prefer-default-export
export const compareTaskStateMaximum = (taskInstant: any) => {
  const inputState = R.pathOr({}, ['inputData', 'statuses'], taskInstant)
  const outputState = R.pathOr({}, ['outputData', 'statuses'], taskInstant)

  const inputStateLength = Object.keys(inputState).length
  const outputStateLength = Object.keys(outputState).length

  const StateMapper = {
    [inputStateLength]: { statuses: inputState, data: 'inputData' },
    [outputStateLength]: { statuses: outputState, data: 'outputData' },
  }

  const findStatusesMax = R.max(inputStateLength, outputStateLength)

  return taskInstant[StateMapper[findStatusesMax].data]
}
