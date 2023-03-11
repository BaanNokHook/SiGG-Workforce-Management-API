export const addressResponse = {
      status: 'success',
      data: {
        feature: {
          type: 'Feature',
          properties: {
            waypoint_order: [],
          },
          geometry: {
            type: 'MultiPoint',
            coordinates: [
              [99.02610426089701, 18.852238213056904],
              [99.02535520410251, 18.851615305394237],
              [99.02610426089701, 18.852238213056904],
            ],
          },
        },
        metadata: {
          direction: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {
                  distance: 105,
                  duration: 16,
                  trafficTime: 16,
                },
                geometry: {
                  type: 'LineString',
                  coordinates: [
                    [99.02615, 18.85214],
                    [99.02542, 18.85179],
                    [99.02542, 18.85179],
                    [99.02542, 18.85162],
                    [99.02542, 18.85162],
                  ],
                },
              },
              {
                type: 'Feature',
                properties: {
                  distance: 105,
                  duration: 15,
                  trafficTime: 15,
                },
                geometry: {
                  type: 'LineString',
                  coordinates: [
                    [99.02542, 18.85162],
                    [99.02542, 18.85179],
                    [99.02542, 18.85179],
                    [99.02615, 18.85214],
                    [99.02615, 18.85214],
                  ],
                },
              },
            ],
          },
          waypoint_order: [],
        },
      },
      message: null,
    }
    