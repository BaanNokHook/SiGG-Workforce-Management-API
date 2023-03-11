export const smsResponse = {
      status: 200,
      code: 'SUCCESS',
      data: {
        message: {
          $: {
            id: '8ae92820-e774-11ea-a14f-37cd1fc5be26',
          },
          rsr: [
            {
              $: {
                type: 'ack',
              },
              destination: [
                {
                  $: {
                    messageid: '8ae92820-e774-11ea-a14f-37cd1fc5be26',
                  },
                  address: [
                    {
                      number: [
                        {
                          _: '0889942569',
                          $: {
                            type: 'international',
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
              source: [
                {
                  address: [
                    {
                      number: [
                        {
                          _: 'title',
                          $: {
                            type: '',
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
              'service-id': ['2311540001'],
              rsr_detail: [
                {
                  $: {
                    status: 'Success',
                  },
                  code: ['000'],
                  description: ['Success'],
                },
              ],
            },
          ],
        },
      },
    }
    