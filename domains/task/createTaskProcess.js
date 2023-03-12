import R from 'ramda'

/**
 *          "option" : {
                "name" : "CLONE",
                "validator" : {
                    "path" : [
                        "deliveryStatus"
                    ],
                    "typeOf" : "Array",
                    "equals" : "DELIVER"
                },
                "args" : "DELIVER",
                "fromPath" : [
                    "tasks",
                    "*",
                    "deliveryStatus"
                ],
                "toPath" : [
                    "tasks"
                ]
            },
 *
 */
const PROCESS = 'PROCESS'
export default async (orders: any, taskProcessConfig: any) => {
  const processConfig = R.path(['option'], taskProcessConfig)
  if (processConfig.name === 'CLONE') {
    /** split array validate by logic   [ ["tasks"] , ["*" ,"deliveryStatus"] ]  */
    const mapToPath = R.splitWhen(R.equals('*'))(processConfig.fromPath)
    const { validator } = processConfig
    const resultMapper = R.head(
      R.filter(task => R.pathEq(validator.path, validator.equals)(task))(
        R.path(mapToPath[0], orders),
      ),
    )
    const taskResult = R.clone(resultMapper)
    taskResult.deliveryStatus = PROCESS
    orders.tasks.push(taskResult)
    return orders.tasks
  }
}
